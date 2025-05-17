import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline'

export default function Documentation() {
  return (
    <div className="min-h-screen bg-background text-white">
      {/* Navigation */}
      <nav className="p-4">
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">
          ChainForex Documentation
        </h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">The Importance of Reliable Data in Forex Trading</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            In the fast-paced world of forex trading, the accuracy and reliability of price data can mean the difference between 
            profit and loss. Traditional forex trading platforms often rely on centralized data sources, which can be subject to 
            delays, manipulation, or technical failures. ChainForex addresses these critical challenges by leveraging blockchain 
            technology and decentralized oracles to provide transparent, accurate, and real-time forex data.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Technology Stack</h2>
          
          <div className="grid gap-8 md:grid-cols-2">
            <div className="bg-background-lighter p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <ShieldCheckIcon className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                <h3 className="text-xl font-semibold">Sui Blockchain</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Built on Sui's high-performance blockchain, ChainForex leverages Move smart contracts for enhanced security 
                and transparency. Sui's object-centric model enables parallel transaction processing, ensuring rapid trade 
                execution and settlement. The Move language's built-in asset safety features protect your trades and funds 
                with military-grade security.
              </p>
            </div>

            <div className="bg-background-lighter p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <ChartBarIcon className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                <h3 className="text-xl font-semibold">Pyth Network Integration</h3>
              </div>
              <p className="text-gray-300 leading-relaxed">
                ChainForex integrates with Pyth Network, a first-party financial oracle network providing real-time market data. 
                With over 120 major market participants contributing data, including industry leaders like Jane Street, CBOE, 
                and Binance, Pyth ensures highly accurate and manipulation-resistant price feeds for forex pairs.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Key Features</h2>
          <div className="space-y-6">
            <div className="bg-background-lighter p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Real-Time Price Accuracy</h3>
              <p className="text-gray-300 leading-relaxed">
                Through Pyth Network's oracle system, ChainForex provides sub-second price updates for forex pairs. 
                Each price feed aggregates data from multiple trusted sources, ensuring accuracy and reliability even 
                during periods of high market volatility.
              </p>
            </div>

            <div className="bg-background-lighter p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Transparent and Immutable</h3>
              <p className="text-gray-300 leading-relaxed">
                Every trade, price update, and transaction is recorded on the Sui blockchain, creating an immutable 
                audit trail. This transparency allows traders to verify the accuracy of historical data and ensures 
                fair trading conditions for all participants.
              </p>
            </div>

            <div className="bg-background-lighter p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Automated Trading Strategies</h3>
              <p className="text-gray-300 leading-relaxed">
                Build and deploy automated trading strategies with confidence, knowing they're powered by reliable 
                price feeds and executed securely on the Sui blockchain. Our platform's integration with Pyth Network 
                ensures your strategies operate on the most accurate and up-to-date market data available.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Ready to experience the future of forex trading? Connect your wallet and start trading with confidence, 
            backed by the security of Sui blockchain and the reliability of Pyth Network's price feeds.
          </p>
          <Link
            to="/dashboard"
            className="btn-primary inline-flex items-center"
          >
            <CpuChipIcon className="h-5 w-5 mr-2" />
            Launch Platform
          </Link>
        </section>
      </div>
    </div>
  )
}
