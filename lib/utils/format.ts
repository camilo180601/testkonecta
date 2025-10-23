// Formatear números como moneda colombiana
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formatear números con separadores de miles
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("es-CO").format(num)
}

// Formatear fecha
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

// Formatear fecha corta
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

// Parsear número con formato de miles
export function parseFormattedNumber(value: string): number {
  return Number.parseFloat(value.replace(/[.,]/g, ""))
}
