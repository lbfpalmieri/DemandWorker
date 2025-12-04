import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { display } from '@utils/date'
import { AddDemandModal } from '@components/AddDemandModal'
import { DemandCard } from '@components/DemandCard'
import { useDemand } from '@store/DemandContext'
import { searchDemandIds } from '../db/sqlite'

export default function WeekPage() {
  const { state, dispatch } = useDemand()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = React.useState(params.get('q') || '')
  const weekDemands = state.demands.filter(d => d.semanaKey === state.currentWeek.key)
  const [ids, setIds] = React.useState<string[] | null>(null)
  const filteredBase = weekDemands
  const filtered = q && ids ? filteredBase.filter(d => ids.includes(d.id)) : filteredBase.filter(d => [d.titulo, d.descricao ?? '', d.cliente].some(s => s.toLowerCase().includes(q.toLowerCase())))
  const sortByOrder = (a: any, b: any) => (b.ordem ?? 0) - (a.ordem ?? 0)
  const inProgress = filtered.filter(d => d.status !== 'concluida').sort(sortByOrder)
  const done = filtered.filter(d => d.status === 'concluida').sort(sortByOrder)
  const clientsInProgress = Array.from(new Set(inProgress.map(d => d.cliente)))
  const clientsDone = Array.from(new Set(done.map(d => d.cliente)))

  const titleVariant = { hidden: { opacity: 0, y: -4 }, show: { opacity: 1, y: 0 } }

  React.useEffect(() => {
    const next = new URLSearchParams(params)
    if (q) next.set('q', q); else next.delete('q')
    setParams(next, { replace: true })
  }, [q])

  React.useEffect(() => {
    let alive = true
    if (!q.trim()) { setIds(null); return }
    searchDemandIds(q).then(res => { if (alive) setIds(res) }).catch(() => setIds(null))
    return () => { alive = false }
  }, [q])

  return (
    <div className="space-y-6">
      <motion.div className="glass-panel p-4 neon-border panel-flow">
        <motion.p className="text-white/80 text-sm" variants={titleVariant} initial={false} whileInView="show" viewport={{ once: true, amount: 0.9 }}>Período da semana</motion.p>
        <motion.p className="font-futuristic text-neon-blue neon-title" variants={titleVariant} initial={false} whileInView="show" viewport={{ once: true, amount: 0.9 }}>
          {display(state.currentWeek.startDate)} — {display(state.currentWeek.endDate)}
        </motion.p>
      </motion.div>
      <div className="flex items-center justify-end">
        <motion.div className="flex items-center gap-3">
          <motion.div className="flex items-center gap-2 bg-[#0b1326] border border-white/10 px-3 py-2 rounded-lg"
            whileHover={{ y: -2, scale: 1.01 }}>
            <input lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" autoComplete="off" className="bg-transparent text-white w-40" placeholder="Buscar..." value={q} onChange={e => setQ(e.target.value)} />
          </motion.div>
          <AddDemandModal semanaKey={state.currentWeek.key} />
        </motion.div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <motion.h3 className="font-futuristic text-neon-blue mb-2 neon-title" variants={titleVariant} initial={false} whileInView="show" viewport={{ once: true, amount: 0.9 }}>Em andamento</motion.h3>
          <AnimatePresence initial={false}>
            {inProgress.length === 0 && (
              <p className="text-white/60">Nenhuma demanda em andamento.</p>
            )}
            {clientsInProgress.map(c => (
              <motion.div key={c} className="space-y-2 mb-4">
                <motion.div className="glass-panel neon-border panel-flow px-3 py-2 text-base text-white neon-strong tracking-wide" whileHover={{ y: -2 }}>{c}</motion.div>
                {inProgress.filter(d => d.cliente === c).map(d => (
                  <DemandCard key={d.id} demand={d} onToggle={(status) => dispatch({ type: 'toggle_status', id: d.id, status })} />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
        <section>
          <motion.h3 className="font-futuristic text-neon-green mb-2 neon-title" variants={titleVariant} initial={false} whileInView="show" viewport={{ once: true, amount: 0.9 }}>Concluídas da semana</motion.h3>
          <AnimatePresence initial={false}>
            {done.length === 0 && (
              <p className="text-white/60">Nada concluído ainda.</p>
            )}
            {clientsDone.map(c => (
              <motion.div key={c} className="space-y-2 mb-4">
                <motion.div className="glass-panel neon-border panel-flow px-3 py-2 text-base text-white neon-strong tracking-wide" whileHover={{ y: -2 }}>{c}</motion.div>
                {done.filter(d => d.cliente === c).map(d => (
                  <DemandCard key={d.id} demand={d} onToggle={(status) => dispatch({ type: 'toggle_status', id: d.id, status })} />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>
      </div>
    </div>
  )
}

