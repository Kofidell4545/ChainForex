from trading_bot import TradingBot
import signal
import sys

def signal_handler(sig, frame):
    print('\nStopping bot...')
    bot.stop()
    sys.exit(0)

if __name__ == "__main__":
    # Create and start the bot
    bot = TradingBot()
    
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Run the bot
    print("Starting bot... Press Ctrl+C to stop")
    bot.run()
