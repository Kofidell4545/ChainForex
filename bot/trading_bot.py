import time
from datetime import datetime, timedelta
import random
from typing import Dict, List, Optional

class TradingBot:
    def __init__(self):
        self.positions = []
        self.next_position_id = 1
        self.max_positions = 10
        self.risk_per_trade = 0.02  # 2% risk per trade
        self.base_price = 1.0935
        self.volatility = 0.0002
        self.last_update = datetime.now()
        self.price_history = self._generate_price_history()
        
    def _generate_price_history(self, points=100) -> List[Dict]:
        history = []
        current_time = datetime.now()
        price = self.base_price
        
        for i in range(points):
            noise = random.gauss(0, self.volatility)
            trend = random.gauss(0, self.volatility)  # Add some trend
            price += noise + trend
            
            history.append({
                'timestamp': (current_time - timedelta(minutes=15*(points-i))).isoformat(),
                'price': round(price, 5),
                'volume': round(random.uniform(100000, 1000000), 2)
            })
        return history

    def analyze_market(self) -> Dict:
        # Update price with realistic movement
        time_diff = (datetime.now() - self.last_update).total_seconds()
        noise = random.gauss(0, self.volatility * (time_diff/60)**0.5)
        
        current_price = self.price_history[-1]['price'] + noise
        current_price = round(current_price, 5)
        
        # Calculate technical indicators
        sma_20 = sum(h['price'] for h in self.price_history[-20:]) / 20
        sma_50 = sum(h['price'] for h in self.price_history[-50:]) / 50
        
        # Generate signal based on moving averages
        if sma_20 > sma_50 * 1.0001:
            signal = 'buy'
            strength = min((sma_20/sma_50 - 1) * 1000, 1)
        elif sma_20 < sma_50 * 0.9999:
            signal = 'sell'
            strength = min((1 - sma_20/sma_50) * 1000, 1)
        else:
            signal = 'hold'
            strength = 0
            
        # Update price history
        self.price_history.append({
            'timestamp': datetime.now().isoformat(),
            'price': current_price,
            'volume': round(random.uniform(100000, 1000000), 2)
        })
        self.price_history.pop(0)
        self.last_update = datetime.now()
        
        return {
            'price': current_price,
            'signal': signal,
            'strength': round(strength, 2),
            'timestamp': datetime.now().isoformat(),
            'change_24h': round((current_price - self.price_history[0]['price']) / self.price_history[0]['price'] * 100, 2),
            'high_24h': round(max(h['price'] for h in self.price_history), 5),
            'low_24h': round(min(h['price'] for h in self.price_history), 5),
            'volume_24h': round(sum(h['volume'] for h in self.price_history[-96:]), 2),  # Last 24 hours (96 15-min periods)
            'sma_20': round(sma_20, 5),
            'sma_50': round(sma_50, 5),
            'price_history': self.price_history[-96:]  # Last 24 hours of price data
        }
    
    def calculate_position_size(self, price: float, stop_loss_pips: int = 50) -> float:
        """Calculate position size based on risk management rules"""
        account_balance = 100000  # Mock balance
        risk_amount = account_balance * self.risk_per_trade
        position_size = risk_amount / (stop_loss_pips * 0.0001)
        return round(position_size, 2)
    
    def open_position(self, signal: Dict) -> Optional[Dict]:
        if len(self.positions) >= self.max_positions:
            return None

        # Calculate position size based on risk management
        account_size = 100000  # Mock account size
        risk_amount = account_size * self.risk_per_trade
        position_size = signal.get('size', risk_amount)

        position = {
            'id': self.next_position_id,
            'type': signal['signal'],
            'size': position_size,
            'entry_price': signal['price'],
            'timestamp': datetime.now().isoformat(),
            'current_pnl': 0,
            'risk_reward_ratio': 2.0,  # Target profit is 2x the risk
            'stop_loss': round(signal['price'] * (0.99 if signal['signal'] == 'buy' else 1.01), 5),
            'take_profit': round(signal['price'] * (1.02 if signal['signal'] == 'buy' else 0.98), 5)
        }

        self.positions.append(position)
        self.next_position_id += 1
        return position

    def close_position(self, position_id: int) -> bool:
        for i, position in enumerate(self.positions):
            if position['id'] == position_id:
                self.positions.pop(i)
                return True
        return False

    def monitor_positions(self) -> List[Dict]:
        current_price = self.analyze_market()['price']
        
        for position in self.positions:
            # Calculate P&L
            if position['type'] == 'buy':
                position['current_pnl'] = round((current_price - position['entry_price']) * position['size'], 2)
                position['pnl_percentage'] = round((current_price - position['entry_price']) / position['entry_price'] * 100, 2)
            else:  # sell
                position['current_pnl'] = round((position['entry_price'] - current_price) * position['size'], 2)
                position['pnl_percentage'] = round((position['entry_price'] - current_price) / position['entry_price'] * 100, 2)
            
            # Check stop loss and take profit
            if (position['type'] == 'buy' and current_price <= position['stop_loss']) or \
               (position['type'] == 'sell' and current_price >= position['stop_loss']):
                position['status'] = 'stopped_out'
            elif (position['type'] == 'buy' and current_price >= position['take_profit']) or \
                 (position['type'] == 'sell' and current_price <= position['take_profit']):
                position['status'] = 'take_profit'
            else:
                position['status'] = 'open'

        return self.positions

    def run(self):
        """Main bot loop - runs 24/7"""
        print("Bot started...")
        
        while True:
            try:
                signal = self.analyze_market()
                
                if signal['signal'] in ['buy', 'sell'] and signal['strength'] > 0.7:
                    position = self.open_position(signal)
                    if position:
                        print(f"Opened {position['type']} position of {position['size']} units at {position['entry_price']}")
                
                active_positions = self.monitor_positions()
                for position in active_positions:
                    print(f"Position {position['id']} P/L: {position['current_pnl']:.2f}")
                
                time.sleep(5)
                
            except Exception as e:
                print(f"Error in bot execution: {e}")
                self.is_running = False
    
    def stop(self):
        """Stop the bot"""
        self.is_running = False
        print("Bot stopped.")
