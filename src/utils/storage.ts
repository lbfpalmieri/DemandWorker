export const loadClients = (): string[] => {
  try {
    const raw = localStorage.getItem('dw_clients')
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string') : []
  } catch {
    return []
  }
}

export const saveClients = (list: string[]): void => {
  try {
    const unique = Array.from(new Set(list.map((s) => s.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))
    localStorage.setItem('dw_clients', JSON.stringify(unique))
  } catch {
    // ignore
  }
}
