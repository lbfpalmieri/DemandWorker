import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDemand } from '@store/DemandContext'
import { searchDemandIds } from '../db/sqlite'
import { display } from '@utils/date'
import { renderDescription } from '@utils/format'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@components/Badge'

export default function HistoryPage() {
  const { state } = useDemand()
  const [cliente, setCliente] = React.useState<string | 'todos'>('todos')
  const [prioridade, setPrioridade] = React.useState<'todas'|'baixa'|'media'|'alta'>('todas')
  const [status, setStatus] = React.useState<'todas'|'concluida'|'nao_concluida'|'urgente'>('concluida')
  const [query, setQuery] = React.useState('')
  const [ids, setIds] = React.useState<string[] | null>(null)
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clientes = Array.from(new Set(state.demands.map(d => d.cliente)))

  const base = query && ids ? state.demands.filter(d => ids.includes(d.id)) : state.demands
  const list = base.filter(d => {
    const matchText = query && !ids ? [d.titulo, d.descricao ?? '', d.cliente].some(s => s.toLowerCase().includes(query.toLowerCase())) : true
    const matchCliente = cliente === 'todos' ? true : d.cliente === cliente
    const matchPrioridade = prioridade === 'todas' ? true : d.prioridade === prioridade
    const matchStatus = status === 'todas' ? true : d.status === status
    return matchText && matchCliente && matchPrioridade && matchStatus
  }).sort((a,b) => a.semanaKey.localeCompare(b.semanaKey))

  const allIds = list.map(d => d.id)
  const allExpanded = allIds.length > 0 && allIds.every(id => expanded.has(id))
  const expandAll = () => setExpanded(new Set(allIds))
  const collapseAll = () => setExpanded(new Set())

  const grouped = list.reduce<Record<string, typeof list>>( (acc, d) => {
    acc[d.semanaKey] = acc[d.semanaKey] || []
    acc[d.semanaKey].push(d)
    return acc
  }, {})

  React.useEffect(() => {
    let alive = true
    const q = query.trim()
    if (!q) { setIds(null); return }
    searchDemandIds(q).then(r => { if (alive) setIds(r) }).catch(() => setIds(null))
    return () => { alive = false }
  }, [query])

  return (
    <div className="space-y-4">
      <motion.div className="glass-panel p-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex items-center gap-2 bg-[#0b1326] border border-white/10 px-3 py-2 rounded-lg">
            <input lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" autoComplete="off" className="bg-transparent text-white w-full" placeholder="Buscar..." value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" value={cliente} onChange={e => setCliente(e.target.value as any)}>
            <option value="todos">Todos os clientes</option>
            {clientes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" value={prioridade} onChange={e => setPrioridade(e.target.value as any)}>
            <option value="todas">Todas as prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
          <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" value={status} onChange={e => setStatus(e.target.value as any)}>
            <option value="todas">Todos os status</option>
            <option value="concluida">Concluída</option>
            <option value="nao_concluida">Não concluída</option>
            <option value="urgente">Urgente</option>
          </select>
          <button className="button-neon" onClick={() => (allExpanded ? collapseAll() : expandAll())}>{allExpanded ? 'Recolher tudo' : 'Expandir tudo'}</button>
        </div>
      </motion.div>

      {Object.entries(grouped).length === 0 && (
        <p className="text-white/60">Nenhum item no histórico com os filtros atuais.</p>
      )}

      {Object.entries(grouped).map(([weekKey, items]) => (
        <motion.div key={weekKey} className="glass-panel p-4">
          <motion.h4 className="font-futuristic text-neon-blue mb-2 neon-title">Semana {weekKey.split('_').map(display).join(' — ')}</motion.h4>
          <div className="grid gap-2">
            {items.map(d => (
              <div
                key={d.id}
                className="border border-white/10 rounded-lg"
                style={{
                  background: d.status === 'concluida'
                    ? 'linear-gradient(135deg, rgba(0,255,157,0.20), rgba(0,255,157,0.08))'
                    : d.prioridade === 'alta'
                      ? 'linear-gradient(135deg, rgba(255,61,113,0.20), rgba(255,61,113,0.08))'
                      : d.prioridade === 'media'
                        ? 'linear-gradient(135deg, rgba(255,200,0,0.18), rgba(255,200,0,0.07))'
                        : 'linear-gradient(135deg, rgba(76,201,240,0.16), rgba(76,201,240,0.06))'
                }}
              >
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-white neon-strong">{d.titulo}</p>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white font-semibold neon-strong">{d.cliente}</span>
                      <span>Incluída: {display(d.dataInclusao)}</span>
                      <span>Prioridade: {d.prioridade}</span>
                      <span>Status: {d.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* prioridade em cor diferenciada */}
                    <PriorityBadge prioridade={d.prioridade} />
                    <button className="inline-flex items-center gap-1 text-white/80 hover:text-white" onClick={() => toggle(d.id)} title="Detalhes">
                      <span className="text-xs">Detalhes</span>
                      <motion.span animate={{ rotate: expanded.has(d.id) ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} />
                      </motion.span>
                    </button>
                  </div>
                </div>
                <AnimatePresence initial={false}>
                  {expanded.has(d.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24 }}
                      className="px-3 pb-3"
                    >
                      <div className="bg-[#0b1326] border border-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-neon-green text-xs">Concluída</span>
                          <span className="text-white/60 text-xs">Incluída em {display(d.dataInclusao)}</span>
                        </div>
                        <div className="prose prose-invert max-w-none text-white/90 whitespace-pre-wrap">
                          {d.descricao ? renderDescription(d.descricao) : <span className="text-white/60 text-sm">Sem descrição</span>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

const PriorityBadge: React.FC<{ prioridade: 'baixa' | 'media' | 'alta' }> = ({ prioridade }) => {
  const color = prioridade === 'alta' ? 'neon.red' : prioridade === 'media' ? 'neon.orange' : 'neon.green'
  const label = prioridade.charAt(0).toUpperCase() + prioridade.slice(1)
  return <Badge color={color}>{label}</Badge>
}

