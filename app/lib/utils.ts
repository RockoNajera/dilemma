export function fmtFullName(name: string, lastname: string, username: string): string {
  return [name, lastname].filter(Boolean).join(' ') || username
}

export function fmtCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  return String(n)
}
