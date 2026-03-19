export function formatNumber(value: number): string {
  return value.toLocaleString("ko-KR")
}

export function parseNumber(value: string): number {
  const cleaned = value.replace(/[^\d]/g, "")
  return cleaned ? parseInt(cleaned, 10) : 0
}

export function formatBusinessNumber(value: string): string {
  const cleaned = value.replace(/[^\d]/g, "")
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5, 10)}`
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function getTodayString(): string {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

export function calculateTax(supplyAmount: number): number {
  return Math.floor(supplyAmount * 0.1)
}
