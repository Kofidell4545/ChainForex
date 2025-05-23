from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from trading_bot import TradingBot
from typing import Dict, List
import uvicorn

app = FastAPI()
bot = TradingBot()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/market/analysis")
async def get_market_analysis():
    """Get current market analysis"""
    return bot.analyze_market()

@app.get("/positions")
async def get_positions() -> List[Dict]:
    """Get all open positions"""
    return bot.positions

from pydantic import BaseModel

class OrderRequest(BaseModel):
    type: str
    size: float

@app.post("/position/open")
async def open_position(order: OrderRequest):
    """Open a new position"""
    signal = bot.analyze_market()
    signal['signal'] = order.type
    signal['strength'] = 1.0  # Force the trade
    signal['size'] = order.size
    
    position = bot.open_position(signal)
    if position:
        return position
    raise HTTPException(status_code=400, detail="Could not open position")

@app.delete("/position/{position_id}")
async def close_position(position_id: int):
    """Close a specific position"""
    if bot.close_position(position_id):
        return {"status": "success", "message": f"Position {position_id} closed"}
    raise HTTPException(status_code=404, detail="Position not found")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
