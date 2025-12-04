import React from 'react'
import { motion } from 'framer-motion'
import { useDemand } from '@store/DemandContext'
import { searchDemandIds } from '../db/sqlite'

export default function ClientsPage() {
  const { state } = useDemand()
  const [order, setOrder] = React.useState<'nome'|'qtd'|'prioridade'>('qtd')
  const [query, setQuery] = React.useState('')
  const [ids, setIds] = React.useState<string[] | null>(null)
  const base = query && ids ? state.demands.filter(d => ids.includes(d.id)) : state.demands
  const clients = Array.from(new Set(base.map(d => d.cliente)))

  const stats = clients.map(c => {
    const items = base.filter(d => d.cliente === c)
    const qtd = items.length
    const urgentes = items.filter(d => d.status === 'urgente').length
    const concluidas = items.filter(d => d.status === 'concluida').length
    const prioScore = items.reduce((acc, d) => acc + (d.prioridade === 'alta' ? 3 : d.prioridade === 'media' ? 2 : 1), 0)
    return { cliente: c, qtd, urgentes, concluidas, prioScore }
  }).sort((a,b) => {
    if (order === 'nome') return a.cliente.localeCompare(b.cliente)
    if (order === 'prioridade') return b.prioScore - a.prioScore
    return b.qtd - a.qtd
  })

  React.useEffect(() => {
    let alive = true
    const q = query.trim()
    if (!q) { setIds(null); return }
    searchDemandIds(q).then(r => { if (alive) setIds(r) }).catch(() => setIds(null))
    return () => { alive = false }
  }, [query])

  return (
    <div className="space-y-4">
      <motion.div className="glass-panel neon-border panel-flow p-4 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#0b1326] border border-white/10 px-3 py-2 rounded-lg">
          <input lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" autoComplete="off" className="bg-transparent text-white w-64" placeholder="Buscar demandas por texto" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <label className="text-white/70">Ordenar por</label>
        <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" value={order} onChange={e => setOrder(e.target.value as any)}>
          <option value="qtd">Quantidade</option>
          <option value="nome">Nome</option>
          <option value="prioridade">Prioridade</option>
        </select>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-4">
        {stats.map(s => (
          <motion.div key={s.cliente} className="glass-panel neon-border panel-flow p-4" whileHover={{ y: -2, scale: 1.01 }}>
            <motion.h4 className="font-futuristic text-neon-blue neon-title">{s.cliente}</motion.h4>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <motion.div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" whileHover={{ scale: 1.02 }}>Total: {s.qtd}</motion.div>
              <motion.div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" whileHover={{ scale: 1.02 }}>Urgentes: {s.urgentes}</motion.div>
              <motion.div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" whileHover={{ scale: 1.02 }}>Concluídas: {s.concluidas}</motion.div>
              <motion.div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2" whileHover={{ scale: 1.02 }}>Score de prioridade: {s.prioScore}</motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

