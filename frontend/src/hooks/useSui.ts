import { useEffect, useState } from 'react'
import { JsonRpcProvider, Connection } from '@mysten/sui.js'

const provider = new JsonRpcProvider(new Connection({
  fullnode: 'https://fullnode.devnet.sui.io',
  faucet: 'https://faucet.devnet.sui.io/gas',
}))

export function useSui() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const initSui = async () => {
      try {
        await provider.getRpcApiVersion()
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect to Sui'))
        setLoading(false)
      }
    }

    initSui()
  }, [])

  return {
    provider,
    loading,
    error,
  }
}
