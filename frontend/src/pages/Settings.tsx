import { useState } from 'react'

export default function Settings() {
  const [settings, setSettings] = useState({
    tradingEnabled: false,
    maxOrderSize: '1000',
    priceAlerts: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement settings update
    console.log('Settings updated:', settings)
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Trading Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900">Automated Trading</h3>
              <p className="mt-1 text-sm text-gray-500">Enable or disable automated trading based on signals</p>
            </div>
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 ${
                settings.tradingEnabled ? 'bg-primary-600' : 'bg-gray-200'
              }`}
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  tradingEnabled: !prev.tradingEnabled,
                }))
              }
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  settings.tradingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label htmlFor="maxOrderSize" className="block text-sm font-medium text-gray-700">
              Maximum Order Size (EUR)
            </label>
            <input
              type="number"
              id="maxOrderSize"
              value={settings.maxOrderSize}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  maxOrderSize: e.target.value,
                }))
              }
              className="input mt-1"
              min="0"
              step="100"
            />
          </div>

          <div className="flex items-center">
            <input
              id="priceAlerts"
              type="checkbox"
              checked={settings.priceAlerts}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  priceAlerts: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
            />
            <label htmlFor="priceAlerts" className="ml-2 block text-sm text-gray-900">
              Enable price alerts
            </label>
          </div>

          <button type="submit" className="btn-primary">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  )
}
