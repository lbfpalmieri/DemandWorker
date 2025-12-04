import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { Demand } from '@types'
import { NeonCheckbox } from './NeonCheckbox'
import { Badge } from './Badge'
import { EditDemandModal } from './EditDemandModal'
import { DemandDetailModal } from './DemandDetailModal'
import { renderDescription } from '@utils/format'

type Props = { demand: Demand; onToggle: (status: Demand['status']) => void }

export const DemandCard: React.FC<Props> = ({ demand, onToggle }) => {
  const isDone = demand.status === 'concluida'
  const urgent = demand.status === 'urgente'
  const speed = demand.prioridade === 'alta' ? '3s' : demand.prioridade === 'media' ? '6s' : '9s'
  const c1 = 'rgba(76,201,240,0.75)'
  const c2 = 'rgba(0,234,255,0.55)'
  const bg = isDone
    ? 'linear-gradient(135deg, rgba(0,255,157,0.20), rgba(0,255,157,0.08))'
    : demand.prioridade === 'alta'
      ? 'linear-gradient(135deg, rgba(255,61,113,0.20), rgba(255,61,113,0.08))'
      : demand.prioridade === 'media'
        ? 'linear-gradient(135deg, rgba(255,200,0,0.18), rgba(255,200,0,0.07))'
        : 'linear-gradient(135deg, rgba(76,201,240,0.16), rgba(76,201,240,0.06))'
  return (
    <motion.div layout className={`card-surface p-4 neon-border`}
      style={{ ['--neon-speed' as any]: speed, ['--neon-c1' as any]: c1, ['--neon-c2' as any]: c2, background: bg }}
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}>
      <div className="flex items-start gap-4">
        <NeonCheckbox checked={isDone} onChange={(v) => onToggle(v ? 'concluida' : (demand.carregada ? 'urgente' : 'nao_concluida'))} />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h4 className={`text-white font-semibold neon-strong ${isDone ? 'line-through decoration-neon-green/60' : ''}`}>{demand.titulo}</h4>
            {urgent && <Badge><span className="inline-flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> ⚠️ Urgente</span></Badge>}
          </div>
          {demand.descricao && (
            <div className="text-white/85 text-sm mt-1">{renderDescription(demand.descricao)}</div>
          )}
          <div className="mt-3 flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white font-semibold neon-strong">{demand.cliente}</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Prioridade: {demand.prioridade}</span>
            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Incluída: {new Date(demand.dataInclusao).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DemandDetailModal demand={demand} />
          <EditDemandModal demand={demand} />
          <div className={`text-neon-green ${isDone ? '' : 'text-white/20'}`}>
            <CheckCircle2 />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

