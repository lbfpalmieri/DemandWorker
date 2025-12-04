export const colorForClient = (name: string) => {
  const hash = Array.from(name).reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const palette = [
    'neon.cyan', 'neon.blue', 'neon.purple', 'neon.magenta', 'neon.green', 'neon.orange', 'neon.red'
  ]
  return palette[hash % palette.length]
}

