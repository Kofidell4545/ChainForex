import React, { useState } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { RocketLaunchIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function Dashboard() {
  const [selectedBot, setSelectedBot] = useState('forex-trend')

  // Sample data - will be replaced with real data from Pyth
  const data = {
    labels: Array.from({ length: 20 }, (_, i) => `${i}h`),
    datasets: [
      {
        label: 'EUR/USD',
        data: Array.from({ length: 20 }, () => 1.0935 + (Math.random() - 0.5) * 0.01),
        borderColor: '#00FFB2',
        backgroundColor: 'rgba(0, 255, 178, 0.1)',
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#4B5563',
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#4B5563',
        },
      },
    },
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">AI Trading Assistant</h1>
        <button className="px-4 py-2 bg-background-lighter rounded-lg text-primary hover:bg-background-light transition-colors">
          Create New Bot
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-light rounded-xl p-6 shadow-glow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-medium text-white">Performance</h2>
                <p className="text-gray-400">Last 24 hours</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-background-lighter transition-colors">
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[300px]">
              <Line options={options} data={data} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {['Total Profit', 'Win Rate', 'Active Positions'].map((title, i) => (
              <div key={title} className="bg-background-light rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
                <p className="text-2xl font-bold text-white">
                  {i === 0 ? '+$1,234.56' : i === 1 ? '76%' : '3'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background-light rounded-xl p-6">
          <h2 className="text-lg font-medium text-white mb-4">Active Bots</h2>
          <div className="space-y-4">
            {['forex-trend', 'crypto-momentum', 'stocks-ml'].map((bot) => (
              <button
                key={bot}
                className={`w-full flex items-center p-4 rounded-lg ${selectedBot === bot ? 'bg-background-lighter text-primary' : 'text-gray-400 hover:bg-background-lighter hover:text-primary'} transition-colors`}
                onClick={() => setSelectedBot(bot)}
              >
                <RocketLaunchIcon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <h3 className="font-medium">{bot.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h3>
                  <p className="text-sm text-gray-500">Running • 3h uptime</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
