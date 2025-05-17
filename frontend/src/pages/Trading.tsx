import { useState } from 'react'

export default function Trading() {
  const [amount, setAmount] = useState('')
  const [orderType, setOrderType] = useState('buy')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement order submission
    console.log('Order submitted:', { amount, orderType })
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Place Order</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  orderType === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setOrderType('buy')}
              >
                Buy
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  orderType === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                onClick={() => setOrderType('sell')}
              >
                Sell
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (EUR)
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            Place {orderType === 'buy' ? 'Buy' : 'Sell'} Order
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Sample data - will be replaced with real orders */}
              <tr>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-green-600">Buy</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">1,000 EUR</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">1.0935 USD</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">Completed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
