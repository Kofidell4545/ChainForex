import React, { useState, useEffect } from 'react'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'
import { formatNumber } from '../utils/format'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface MarketData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  pythId: string
  high24h: number
  low24h: number
}

const CURRENCY_PAIRS = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    pythId: 'ff61491a931112ddf1bd8147cd1b080f1f8e3c8e579db7a8e3174b0fb8673d50'
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    pythId: 'ec7a7a0100790c93c17fde7326ac483877f5f50b270bf1be85f79ccc2a5de674'
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    pythId: '5a33f2066c25c1f6b8c174430440f51d806f1ae297591f1ae4a5cc3868a08c4c'
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    pythId: '67a6f4dbd07eee4c2d43c53be5df3c8afea62b6ae439f770c5f61ae0c905c299'
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    pythId: 'a0143d7dcab7a8a6f1d7aa0cd9aa9f937ef19ce331c71c4f137ef832421ca06c'
  }
]

// Initialize connection outside component to prevent recreation
const connection = new PriceServiceConnection('https://hermes.pyth.network', {
  timeout: 5000
})

export default function Markets() {
  const [markets, setMarkets] = useState<MarketData[]>(CURRENCY_PAIRS.map(pair => ({
    ...pair,
    price: 1.0 + Math.random() * 0.1,
    change24h: (Math.random() - 0.5) * 2,
    volume24h: Math.random() * 1000000000,
    high24h: 1.1 + Math.random() * 0.1,
    low24h: 0.9 + Math.random() * 0.1
  })))
  const [sortField, setSortField] = useState<keyof MarketData>('symbol')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    let updateInterval: NodeJS.Timeout | null = null
    const pythIds = CURRENCY_PAIRS.map(pair => pair.pythId)
    
    const updatePrices = async () => {
      if (!mounted) return
      
      try {
        setLoading(true)
        setError('')
        
        const priceFeeds = await Promise.race([
          connection.getLatestPriceFeeds(pythIds),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 3000)
          )
        ])
        
        if (!mounted) return
        
        if (!priceFeeds || !Array.isArray(priceFeeds) || priceFeeds.length === 0) {
          throw new Error('No price feeds available')
        }
        
        const updatedMarkets = CURRENCY_PAIRS.map((pair, index) => {
          const feed = priceFeeds[index]
          if (!feed) {
            return {
              ...pair,
              price: 0,
              change24h: 0,
              volume24h: 0,
              high24h: 0,
              low24h: 0
            }
          }
          
          const priceObj = feed.getPriceNoOlderThan(60)
          const currentPrice = Number(priceObj?.price || 0)
          
          return {
            ...pair,
            price: currentPrice,
            change24h: (Math.random() - 0.5) * 2, // Mock data for now
            volume24h: Math.random() * 1000000000,
            high24h: currentPrice * (1 + Math.random() * 0.02),
            low24h: currentPrice * (1 - Math.random() * 0.02)
          }
        })
        
        if (!mounted) return
        
        setMarkets(updatedMarkets)
        setError('')
      } catch (error) {
        if (!mounted) return
        console.error('Error fetching price feeds:', error)
        setError(error instanceof Error ? error.message : 'Failed to fetch market data')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    const startUpdates = () => {
      updatePrices()
      updateInterval = setInterval(updatePrices, 5000) // Update every 5 seconds instead of 1
    }

    startUpdates()

    return () => {
      mounted = false
      if (updateInterval) {
        clearInterval(updateInterval)
      }
    }
  }, [])

  const handleSort = (field: keyof MarketData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedMarkets = [...markets].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    const direction = sortDirection === 'asc' ? 1 : -1

    if (typeof aValue === 'string') {
      return direction * aValue.localeCompare(bValue as string)
    }
    return direction * (Number(aValue) - Number(bValue))
  })

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Forex Markets</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {loading && markets.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
        
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr className="bg-gray-700/50">
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold cursor-pointer hover:bg-gray-700/70"
                    onClick={() => handleSort('symbol')}
                  >
                    Market
                    {sortField === 'symbol' && (
                      sortDirection === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/70"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    {sortField === 'price' && (
                      sortDirection === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/70"
                    onClick={() => handleSort('change24h')}
                  >
                    24h Change
                    {sortField === 'change24h' && (
                      sortDirection === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/70"
                    onClick={() => handleSort('high24h')}
                  >
                    24h High
                    {sortField === 'high24h' && (
                      sortDirection === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/70"
                    onClick={() => handleSort('low24h')}
                  >
                    24h Low
                    {sortField === 'low24h' && (
                      sortDirection === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                  <th 
                    className="px-6 py-4 text-right text-sm font-semibold cursor-pointer hover:bg-gray-700/70"
                    onClick={() => handleSort('volume24h')}
                  >
                    24h Volume
                    {sortField === 'volume24h' && (
                      sortDirection === 'asc' ? <ArrowUpIcon className="inline w-4 h-4 ml-1" /> : <ArrowDownIcon className="inline w-4 h-4 ml-1" />
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {sortedMarkets.map((market) => (
                  <tr 
                    key={market.symbol}
                    className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/trading/${market.symbol}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{market.symbol}</span>
                        <span className="text-sm text-gray-400">{market.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {formatNumber(market.price, 5)}
                    </td>
                    <td className={`px-6 py-4 text-right ${
                      market.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {market.change24h >= 0 ? '+' : ''}{formatNumber(market.change24h, 2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {formatNumber(market.high24h, 5)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      {formatNumber(market.low24h, 5)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      ${formatNumber(market.volume24h, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
