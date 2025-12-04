import React from 'react'
import { useDemand } from '@store/DemandContext'

export const ClientFilter: React.FC<{ clients: string[] }> = ({ clients }) => {
  const { state, dispatch } = useDemand()
  const active = state.filterCliente
  return (
    <div className="glass-panel p-3 flex flex-wrap gap-2">
      <button className={`button-neon ${active === null ? 'ring-1 ring-neon-cyan/40' : ''}`} onClick={() => dispatch({ type: 'set_filter', cliente: null })}>Todos</button>
      {clients.map(c => (
        <button key={c} className={`button-neon ${active === c ? 'ring-1 ring-neon-purple/40' : ''}`} onClick={() => dispatch({ type: 'set_filter', cliente: c })}>
          {c}
        </button>
      ))}
    </div>
  )
}

