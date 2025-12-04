import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus } from 'lucide-react'
import { useDemand } from '@store/DemandContext'
import type { Demand } from '@types'
import { RichTextToolbar } from './RichTextToolbar'
import { ClientSelector } from './ClientSelector'

type Props = { semanaKey: string }

export const AddDemandModal: React.FC<Props> = ({ semanaKey }) => {
  const { dispatch } = useDemand()
  const [open, setOpen] = React.useState(false)
  const [titulo, setTitulo] = React.useState('')
  const [descricao, setDescricao] = React.useState('')
  const [cliente, setCliente] = React.useState('')
  const [prioridade, setPrioridade] = React.useState<'baixa'|'media'|'alta'>('media')
  const titleRef = React.useRef<HTMLInputElement>(null)
  const descRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  React.useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 0)
  }, [open])

  const add = () => {
    if (!titulo.trim() || !cliente.trim()) return
    const payload: Omit<Demand, 'id' | 'dataInclusao'> = {
      titulo, descricao, cliente, prioridade, status: 'nao_concluida', semanaKey, carregada: false,
    }
    dispatch({ type: 'add_demand', demand: payload })
    setOpen(false)
    setTitulo(''); setDescricao(''); setCliente(''); setPrioridade('media')
  }

  return (
    <div>
      <button className="button-neon" onClick={() => setOpen(true)}>
        <Plus /> Adicionar Nova Demanda
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50" onClick={() => setOpen(false)}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-panel neon-border w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-futuristic text-neon-purple">Nova Demanda</h3>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X /></button>
              </div>
              <div className="grid gap-3">
                <input lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" autoComplete="off" ref={titleRef} className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
                <RichTextToolbar targetRef={descRef} value={descricao} onChange={setDescricao} />
                <textarea lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" ref={descRef} className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" placeholder="Descrição (opcional)" value={descricao} onChange={e => setDescricao(e.target.value)} />
                <ClientSelector value={cliente} onChange={setCliente} />
                <div className="flex items-center gap-3">
                  <label className="text-white/70">Prioridade</label>
                  <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" value={prioridade} onChange={e => setPrioridade(e.target.value as any)}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button className="button-neon" onClick={add}>Adicionar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

