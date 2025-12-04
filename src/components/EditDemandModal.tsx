import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Pencil, Trash2 } from 'lucide-react'
import { useDemands } from '@store/hooks'
import type { Demand } from '@types'
import { RichTextToolbar } from './RichTextToolbar'
import { ClientSelector } from './ClientSelector'

type Props = { demand: Demand }

export const EditDemandModal: React.FC<Props> = ({ demand }) => {
  const { edit, remove, setPriority, setClient } = useDemands()
  const [open, setOpen] = React.useState(false)
  const [titulo, setTitulo] = React.useState(demand.titulo)
  const [descricao, setDescricao] = React.useState(demand.descricao ?? '')
  const [cliente, setClienteLocal] = React.useState(demand.cliente)
  const [prioridade, setPrioridadeLocal] = React.useState(demand.prioridade)
  const descRef = React.useRef<HTMLTextAreaElement>(null)

  const save = () => {
    if (!titulo.trim() || !cliente.trim()) return
    edit(demand.id, { titulo, descricao, cliente: cliente, prioridade })
    setClient(demand.id, cliente)
    setPriority(demand.id, prioridade)
    setOpen(false)
  }

  const del = () => {
    if (confirm('Deseja realmente excluir esta demanda?')) {
      remove(demand.id)
      setOpen(false)
    }
  }

  return (
    <div>
      <button className="text-white/70 hover:text-white" onClick={() => setOpen(true)} title="Editar"><Pencil /></button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="glass-panel neon-border w-full max-w-xl p-6"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-futuristic text-neon-purple">Editar Demanda</h3>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X /></button>
              </div>
              <div className="grid gap-3">
                <input lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" autoComplete="off" className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" placeholder="Título" value={titulo} onChange={e => setTitulo(e.target.value)} />
                <RichTextToolbar targetRef={descRef} value={descricao} onChange={setDescricao} />
                <textarea lang="pt-BR" spellCheck={false} autoCorrect="off" autoCapitalize="none" ref={descRef} className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" placeholder="Descrição" value={descricao} onChange={e => setDescricao(e.target.value)} />
                <ClientSelector value={cliente} onChange={setClienteLocal} />
                <div className="flex items-center gap-3">
                  <label className="text-white/70">Prioridade</label>
                  <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10" value={prioridade} onChange={e => setPrioridadeLocal(e.target.value as any)}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button className="button-neon" onClick={del}><Trash2 /> Excluir</button>
                <div className="flex items-center gap-2">
                  <button className="button-neon" onClick={() => setOpen(false)}>Cancelar</button>
                  <button className="button-neon" onClick={save}>Salvar</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

