import React from 'react'
import { motion } from 'framer-motion'
import { useSettings } from '@store/hooks'

export default function ConfigPage() {
  const { settings, setSettings } = useSettings()
  const [importText, setImportText] = React.useState('')

  const exportData = () => {
    const payload = {
      demands: JSON.parse(localStorage.getItem('dw_demands') || '[]'),
      weeks: JSON.parse(localStorage.getItem('dw_weeks') || '[]'),
      currentWeek: JSON.parse(localStorage.getItem('dw_current_week') || 'null'),
      settings: JSON.parse(localStorage.getItem('dw_settings') || '{"autoAdvance":true}'),
      filterCliente: JSON.parse(localStorage.getItem('dw_filterCliente') || 'null')
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'demandworker_backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = () => {
    try {
      const obj = JSON.parse(importText)
      if (obj.demands) localStorage.setItem('dw_demands', JSON.stringify(obj.demands))
      if (obj.weeks) localStorage.setItem('dw_weeks', JSON.stringify(obj.weeks))
      if (obj.currentWeek) localStorage.setItem('dw_current_week', JSON.stringify(obj.currentWeek))
      if (obj.settings) localStorage.setItem('dw_settings', JSON.stringify(obj.settings))
      localStorage.setItem('dw_filterCliente', JSON.stringify(obj.filterCliente ?? null))
      alert('Dados importados! Recarregue a página para aplicar.')
    } catch {
      alert('JSON inválido')
    }
  }

  const clearAll = () => {
    if (confirm('Limpar todos os dados do DemandWorker?')) {
      localStorage.removeItem('dw_demands')
      localStorage.removeItem('dw_weeks')
      localStorage.removeItem('dw_current_week')
      localStorage.removeItem('dw_settings')
      localStorage.removeItem('dw_filterCliente')
      alert('Dados limpos! Recarregue a página.')
    }
  }
  return (
    <motion.div className="glass-panel neon-border panel-flow p-6">
      <motion.h3 className="font-futuristic text-neon-blue mb-4 neon-title">Configurações</motion.h3>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white">Avanço automático de semana</p>
          <p className="text-white/60 text-sm">Detecta virada de semana e cria nova automaticamente</p>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" className="checkbox-neon" checked={settings.autoAdvance} onChange={e => setSettings({ autoAdvance: e.target.checked })} />
          <span className="text-white">Ativar</span>
        </label>
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <motion.div className="glass-panel neon-border panel-flow p-4" whileHover={{ y: -2, scale: 1.01 }}>
          <motion.h4 className="font-futuristic text-neon-blue mb-2 neon-strong">Exportar</motion.h4>
          <button className="button-neon" onClick={exportData}>Baixar backup JSON</button>
        </motion.div>
        <motion.div className="glass-panel neon-border panel-flow p-4" whileHover={{ y: -2, scale: 1.01 }}>
          <motion.h4 className="font-futuristic text-neon-blue mb-2 neon-strong">Importar</motion.h4>
          <textarea lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10 w-full h-32" placeholder="Cole o JSON do backup aqui" value={importText} onChange={e => setImportText(e.target.value)} />
          <div className="mt-2">
            <button className="button-neon" onClick={importData}>Importar</button>
          </div>
        </motion.div>
      </div>
      <div className="mt-6">
        <button className="button-neon" onClick={clearAll}>Limpar todos os dados</button>
      </div>
    </motion.div>
  )
}

