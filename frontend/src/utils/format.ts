export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null) return '-'
  
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`
  }
  
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`
  }
  
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`
  }
  
  return value.toFixed(decimals)
}
