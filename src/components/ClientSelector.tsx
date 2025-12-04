import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { useClients } from '@store/hooks'

type Props = {
  value: string
  onChange: (v: string) => void
}

export const ClientSelector: React.FC<Props> = ({ value, onChange }) => {
  const { list, add, rename, remove } = useClients()
  const [open, setOpen] = React.useState(false)
  const [novo, setNovo] = React.useState('')
  const [editing, setEditing] = React.useState<{ from: string; to: string } | null>(null)

  const addClient = () => {
    const n = novo.trim()
    if (!n) return
    add(n)
    setNovo('')
    onChange(n)
  }

  const startEdit = (from: string) => setEditing({ from, to: from })
  const saveEdit = () => {
    if (!editing) return
    const to = editing.to.trim()
    if (!to) return
    rename(editing.from, to)
    if (value === editing.from) onChange(to)
    setEditing(null)
  }

  const del = (nome: string) => {
    remove(nome)
    if (value === nome) onChange('')
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <select className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10 min-w-[220px]" value={value} onChange={e => onChange(e.target.value)}>
          <option value="">Selecione ou adicione…</option>
          {list.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" className="button-neon" onClick={() => setOpen(true)}><Plus /> Adicionar/Gerenciar</button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div className="glass-panel neon-border w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-futuristic text-neon-blue">Clientes</h3>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white"><X /></button>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <input className="bg-[#0b1326] text-white px-3 py-2 rounded-lg border border-white/10 flex-1" placeholder="Novo cliente/área" value={novo} onChange={e => setNovo(e.target.value)} />
                  <button type="button" className="button-neon" onClick={addClient}><Plus /> Adicionar</button>
                </div>
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {list.length === 0 && <p className="text-white/60">Nenhum cliente cadastrado.</p>}
                  {list.map(c => (
                    <div key={c} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                      {editing?.from === c ? (
                        <input className="bg-transparent text-white flex-1" value={editing.to} onChange={e => setEditing({ from: c, to: e.target.value })} />
                      ) : (
                        <span className="text-white">{c}</span>
                      )}
                      <div className="flex items-center gap-2">
                        {editing?.from === c ? (
                          <button className="button-neon" onClick={saveEdit}>Salvar</button>
                        ) : (
                          <button className="text-white/70 hover:text-white" onClick={() => startEdit(c)} title="Editar"><Pencil /></button>
                        )}
                        <button className="text-white/70 hover:text-white" onClick={() => del(c)} title="Excluir"><Trash2 /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

