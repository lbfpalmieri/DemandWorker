import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, Routes, Route, useLocation } from 'react-router-dom'
import WeekPage from '@pages/WeekPage'
import HistoryPage from '@pages/HistoryPage'
import ClientsPage from '@pages/ClientsPage'
import ConfigPage from '@pages/ConfigPage'
 

export default function App() {
  const location = useLocation()
  React.useEffect(() => {
    const apply = () => {
      const els = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLElement>('input[type="text"], textarea, [contenteditable="true"]')
      els.forEach(el => {
        el.setAttribute('lang', 'pt-BR')
        el.setAttribute('spellcheck', 'false')
        el.setAttribute('autocorrect', 'off')
        el.setAttribute('autocapitalize', 'none')
        el.setAttribute('autocomplete', 'off')
      })
    }
    apply()
    const mo = new MutationObserver(() => apply())
    mo.observe(document.body, { childList: true, subtree: true })
    return () => mo.disconnect()
  }, [])

  return (
    <div className="min-h-screen app-bg text-white scroll-smooth">
      <header className="sticky top-0 z-40 bg-neonGradient/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <motion.h1 className="font-futuristic text-2xl text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-blue"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            whileHover={{ scale: 1.03 }}>
            DemandWorker
          </motion.h1>
          <nav className="flex items-center gap-3">
            <Link to="/" className="button-neon">Semana</Link>
            <Link to="/historico" className="button-neon">Histórico</Link>
            <Link to="/clientes" className="button-neon">Clientes</Link>
            <Link to="/config" className="button-neon">Config</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }}>
            <Routes>
              <Route path="/" element={<WeekPage />} />
              <Route path="/historico" element={<HistoryPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/config" element={<ConfigPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>


    </div>
  )
}

