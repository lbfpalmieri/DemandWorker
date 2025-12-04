import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Demand } from '@types'
import { useDemands } from '@store/hooks'
import { display } from '@utils/date'
import { renderDescription } from '@utils/format'

type Props = { demand: Demand }

export const DemandDetailModal: React.FC<Props> = ({ demand }) => {
  const { setStatus } = useDemands()
  const [open, setOpen] = React.useState(false)
  const speed = demand.prioridade === 'alta' ? '3s' : demand.prioridade === 'media' ? '6s' : '9s'
  const c1 = demand.status === 'urgente' ? 'rgba(255,27,107,0.9)' : 'rgba(0,234,255,0.6)'
  const c2 = demand.status === 'urgente' ? 'rgba(0,234,255,0.9)' : 'rgba(181,23,158,0.6)'

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = () => {
    setStatus(demand.id, demand.status === 'concluida' ? (demand.carregada ? 'urgente' : 'nao_concluida') : 'concluida')
  }

  return (
    <div>
      <button className="text-white/70 hover:text-white" title="Ampliar" onClick={() => setOpen(true)}>
        <Maximize2 />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-surface neon-border neon-flow w-full max-w-3xl p-10" onClick={(e) => e.stopPropagation()}
              style={{ ['--neon-speed' as any]: speed, ['--neon-c1' as any]: c1, ['--neon-c2' as any]: c2 }}
              initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-futuristic text-neon-blue text-lg">{demand.titulo}</h3>
                  {demand.status === 'urgente' && (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 border border-white/10 text-white">
                      <span className="inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Urgente</span>
                    </span>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                  <X />
                </button>
              </div>
              <div className="grid gap-3">
                <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/90">
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">Cliente/Área: {demand.cliente}</div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">Prioridade: {demand.prioridade}</div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">Status: {demand.status}</div>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">Incluída: {display(demand.dataInclusao)}</div>
                </div>
                {demand.descricao && (
                  <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white leading-relaxed">
                    {renderDescription(demand.descricao)}
                  </div>
                )}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button className="button-neon" onClick={toggle}>
                  <CheckCircle2 /> {demand.status === 'concluida' ? 'Desmarcar' : 'Marcar concluída'}
                </button>
                <button className="button-neon" onClick={() => setOpen(false)}>Fechar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
