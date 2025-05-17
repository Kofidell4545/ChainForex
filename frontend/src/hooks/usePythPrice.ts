import { useQuery } from '@tanstack/react-query'
import { PriceServiceConnection } from '@pythnetwork/price-service-client'

const connection = new PriceServiceConnection('https://xc-testnet.pyth.network')

export function usePythPrice(priceId: string) {
  return useQuery({
    queryKey: ['pythPrice', priceId],
    queryFn: async () => {
      const priceFeeds = await connection.getLatestPriceFeeds([priceId])
      if (!priceFeeds || priceFeeds.length === 0) {
        throw new Error('Price feed not found')
      }
      return priceFeeds[0]
    },
    refetchInterval: 1000, // Refresh every second
  })
}
