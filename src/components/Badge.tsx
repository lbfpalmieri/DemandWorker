import React from 'react'

const COLORS: Record<string, string> = {
  'neon.cyan': '#00eaff',
  'neon.blue': '#4cc9f0',
  'neon.purple': '#b5179e',
  'neon.magenta': '#ff1b6b',
  'neon.green': '#00ff9d',
  'neon.orange': '#ff8e00',
  'neon.red': '#ff3d71',
}

export const Badge: React.FC<{ color?: string; children: React.ReactNode }> = ({ color = 'neon.red', children }) => {
  const base = COLORS[color] ?? COLORS['neon.red']
  const shadow = `${base}55`
  const border = `${base}44`
  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-white`}
      style={{ boxShadow: `0 0 12px ${shadow}`, border: `1px solid ${border}` }}
      data-color={color}
    >
      {children}
    </span>
  )
}

