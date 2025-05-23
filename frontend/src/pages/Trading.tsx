import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { createChart, DeepPartial, ChartOptions, AreaSeriesOptions } from 'lightweight-charts'

interface Position {
  id: number
  type: string
  size: number
  entry_price: number
  timestamp: string
  current_pnl: number
  pnl_percentage: number
  status: 'open' | 'stopped_out' | 'take_profit'
  stop_loss: number
  take_profit: number
  risk_reward_ratio: number
}

interface MarketData {
  price: number
  signal: string
  strength: number
  timestamp: string
  change_24h: number
  high_24h: number
  low_24h: number
  volume_24h: number
  sma_20: number
  sma_50: number
  price_history: {
    timestamp: string
    price: number
    volume: number
  }[]
}

interface PriceChartProps {
  data: Array<{ time: number; value: number }>
}

const PriceChart = ({ data }: PriceChartProps) => {
  const [isInitialized, setIsInitialized] = useState(false)

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)

  useEffect(() => {
    let timeoutId: number

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth
        })
      }
    }

    const initChart = () => {
      if (!chartContainerRef.current) return

      console.log('Chart container dimensions:', {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight
      })

      const chartOptions: DeepPartial<ChartOptions> = {
        layout: {
          background: { color: '#131722' },
          textColor: '#d1d4dc',
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: '#1C2633' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      }

      chartRef.current = createChart(chartContainerRef.current, chartOptions)

      const seriesOptions: DeepPartial<AreaSeriesOptions> = {
        topColor: '#00FFB2',
        bottomColor: 'rgba(0, 255, 178, 0.1)',
        lineColor: '#00FFB2',
        lineWidth: 2
      }

      seriesRef.current = chartRef.current.addAreaSeries(seriesOptions)
      setIsInitialized(true)

      window.addEventListener('resize', handleResize)
    }

    // Wait for the container to be properly mounted
    timeoutId = window.setTimeout(initChart, 0)

    return () => {
      window.clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
      chartRef.current = null
      seriesRef.current = null
      setIsInitialized(false)
    }
  }, [])

  useEffect(() => {
    console.log('Chart data:', data)
    if (isInitialized && seriesRef.current && data && data.length > 0) {
      const chartData = data.map(d => ({
        time: d.time,
        value: d.value
      }))
      console.log('Transformed chart data:', chartData)
      seriesRef.current.setData(chartData)
    }
  }, [isInitialized, data])

  return <div ref={chartContainerRef} style={{ width: '100%', height: '400px' }} />
}

export default function Trading() {
  const [amount, setAmount] = useState('')
  const [orderType, setOrderType] = useState('buy')
  const [positions, setPositions] = useState<Position[]>([
    {
      id: 1,
      type: 'buy',
      size: 0.5,
      entry_price: 1.09245,
      stop_loss: 1.09145,
      take_profit: 1.09445,
      current_pnl: 10.25,
      timestamp: new Date().toISOString(),
      pnl_percentage: 0.18,
      status: 'open',
      risk_reward_ratio: 2.0
    },
    {
      id: 2,
      type: 'sell',
      size: 0.3,
      entry_price: 1.09285,
      stop_loss: 1.09385,
      take_profit: 1.09085,
      current_pnl: -5.75,
      timestamp: new Date().toISOString(),
      pnl_percentage: -0.12,
      status: 'open',
      risk_reward_ratio: 2.0
    }
  ])

  const [marketData, setMarketData] = useState<any>(() => {
    const now = new Date().getTime()
    const mockData = {
      price: 1.09265,
      signal: 'buy',
      strength: 0.21,
      change_24h: 0.0015,
      high_24h: 1.09304,
      low_24h: 1.09212,
      volume_24h: 52026785.81,
      sma_20: 1.09261,
      sma_50: 1.09238,
      price_history: Array.from({ length: 100 }, (_, i) => ({
        timestamp: new Date(now - (100 - i) * 60000).toISOString(),
        price: 1.09265 + (Math.random() - 0.5) * 0.001,
        volume: Math.random() * 1000000
      }))
    }
    return mockData
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Store market data in a ref to avoid dependency issues
  const marketDataRef = useRef(marketData)
  useEffect(() => {
    marketDataRef.current = marketData
  }, [marketData])

  // Update market data periodically
  useEffect(() => {
    const updateMarketData = () => {
      const data = marketDataRef.current
      const lastPrice = data.price_history[data.price_history.length - 1].price
      const newPrice = lastPrice + (Math.random() - 0.5) * 0.0002
      const now = new Date().getTime()

      setMarketData(prev => ({
        ...prev,
        price: newPrice,
        price_history: [
          ...prev.price_history.slice(1),
          {
            timestamp: new Date(now).toISOString(),
            price: newPrice,
            volume: Math.random() * 1000000
          }
        ],
        high_24h: Math.max(prev.high_24h, newPrice),
        low_24h: Math.min(prev.low_24h, newPrice),
        sma_20: newPrice + (Math.random() - 0.5) * 0.0001,
        sma_50: newPrice + (Math.random() - 0.5) * 0.0001
      }))

      // Update positions P&L
      setPositions(prev => prev.map(pos => ({
        ...pos,
        current_pnl: pos.type === 'buy' 
          ? (newPrice - pos.entry_price) * pos.size * 100000
          : (pos.entry_price - newPrice) * pos.size * 100000,
        pnl_percentage: pos.type === 'buy'
          ? ((newPrice - pos.entry_price) / pos.entry_price) * 100
          : ((pos.entry_price - newPrice) / pos.entry_price) * 100
      })))
    }

    const interval = setInterval(updateMarketData, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmitOrder = async () => {
    if (!amount) {
      setError('Please enter an amount')
      return
    }

    setLoading(true)
    try {
      // Create a new position with mock data
      const newPosition: Position = {
        id: positions.length + 1,
        type: orderType,
        size: parseFloat(amount),
        entry_price: marketData.price,
        stop_loss: orderType === 'buy' ? marketData.price * 0.99 : marketData.price * 1.01,
        take_profit: orderType === 'buy' ? marketData.price * 1.02 : marketData.price * 0.98,
        current_pnl: 0,
        timestamp: new Date().toISOString(),
        pnl_percentage: 0,
        status: 'open',
        risk_reward_ratio: 2.0
      }
      setPositions([...positions, newPosition])
      setAmount('')
      setError('')
    } catch (err) {
      setError('Failed to submit order')
    }
    setLoading(false)
  }

  const handleClosePosition = async (positionId: number) => {
    setLoading(true)
    try {
      setPositions(positions.filter(p => p.id !== positionId))
      setError('')
    } catch (err) {
      setError('Failed to close position')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Market Overview */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Market Overview</h2>
          {marketData && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-mono">${marketData.price.toFixed(4)}</span>
                  <span className={`text-sm ${marketData.change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {marketData.change_24h >= 0 ? '+' : ''}{marketData.change_24h}%
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>24h High: ${marketData.high_24h.toFixed(4)}</span>
                  <span>24h Low: ${marketData.low_24h.toFixed(4)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">24h Volume</div>
                  <div className="font-mono">${(marketData.volume_24h / 1000000).toFixed(2)}M</div>
                </div>
                <div className="bg-gray-700/50 p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Signal</div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${marketData.signal === 'buy' ? 'text-green-400' : marketData.signal === 'sell' ? 'text-red-400' : 'text-gray-400'}`}>
                      {marketData.signal.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-400">{(marketData.strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>SMA 20</span>
                  <span className="font-mono">${marketData.sma_20.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>SMA 50</span>
                  <span className="font-mono">${marketData.sma_50.toFixed(4)}</span>
                </div>
              </div>

              {marketData.price_history.length > 0 && (
                <div className="h-[400px] -mx-6 -mb-6" style={{ minWidth: '300px' }}>
                  <PriceChart
                    data={marketData.price_history.map(d => {
                      const time = Math.floor(new Date(d.timestamp).getTime() / 1000)
                      const value = d.price
                      console.log('Price point:', { time, value, original: d })
                      return { time, value }
                    })}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Form */}
        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Place Order</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Order Type</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${orderType === 'buy' ? 'bg-green-600' : 'bg-gray-700'}`}
                  onClick={() => setOrderType('buy')}
                >
                  Buy
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded ${orderType === 'sell' ? 'bg-red-600' : 'bg-gray-700'}`}
                  onClick={() => setOrderType('sell')}
                >
                  Sell
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount..."
                min="0"
                step="0.01"
                required
              />
            </div>
            <button
              type="button"
              className="w-full px-4 py-2 bg-primary rounded font-medium disabled:opacity-50"
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Open Positions</h2>
          <div className="text-sm text-gray-400">{positions.length} / 10 max</div>
        </div>
        {positions.length > 0 ? (
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.id} className="p-4 bg-gray-700 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`px-2 py-1 rounded ${position.type === 'buy' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                      {position.type.toUpperCase()}
                    </div>
                    <span className="font-mono">${position.size.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-mono ${position.current_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${position.current_pnl.toFixed(2)}
                    </span>
                    <span className={`text-sm ${position.current_pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ({position.pnl_percentage >= 0 ? '+' : ''}{position.pnl_percentage.toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Entry Price</div>
                    <div className="font-mono">${position.entry_price.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Risk/Reward</div>
                    <div>1:{position.risk_reward_ratio}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Stop Loss</div>
                    <div className="font-mono text-red-400">${position.stop_loss.toFixed(4)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Take Profit</div>
                    <div className="font-mono text-green-400">${position.take_profit.toFixed(4)}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs
                      ${position.status === 'open' ? 'bg-blue-400/10 text-blue-400' :
                        position.status === 'stopped_out' ? 'bg-red-400/10 text-red-400' :
                        'bg-green-400/10 text-green-400'
                      }`}>
                      {position.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="px-4 py-1.5 bg-red-500 hover:bg-red-600 rounded text-sm font-medium transition-colors"
                    onClick={() => handleClosePosition(position.id)}
                    disabled={loading || position.status !== 'open'}
                  >
                    {loading ? 'Closing...' : 'Close Position'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-2">No open positions</p>
            <p className="text-sm text-gray-500">Start trading by placing an order above</p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded text-red-400">
          {error}
        </div>
      )}
    </div>
  )
}
