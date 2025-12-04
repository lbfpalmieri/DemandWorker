import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        futuristic: ['Sora', 'Manrope', 'Inter', 'system-ui'],
      },
      colors: {
        base: '#171a21',
        glass: 'rgba(20, 24, 32, 0.75)',
        neon: {
          cyan: '#00eaff',
          blue: '#4cc9f0',
          purple: '#b5179e',
          magenta: '#ff1b6b',
          green: '#00ff9d',
          orange: '#ff8e00',
          red: '#ff3d71'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(76, 201, 240, 0.35), inset 0 0 10px rgba(0, 234, 255, 0.2)',
        soft: '0 10px 40px rgba(0,0,0,0.45)'
      },
      backdropBlur: {
        xs: '2px'
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(76,201,240,0.06) 1px, transparent 1px)',
        neonGradient: 'linear-gradient(135deg, rgba(76,201,240,0.18), rgba(0,234,255,0.16))'
      }
    }
  },
  plugins: []
} satisfies Config

