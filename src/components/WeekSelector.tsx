import React from 'react'
import { CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { useDemand } from '@store/DemandContext'
import { startOfWeek, endOfWeek, weekKey, display } from '@utils/date'

export const WeekSelector: React.FC = () => {
  const { state, dispatch } = useDemand()
  React.useEffect(() => {
    const s = startOfWeek()
    const e = endOfWeek()
    if (state.currentWeek.key !== weekKey(s, e)) {
      dispatch({ type: 'set_week', week: { startDate: s, endDate: e, key: weekKey(s, e) } })
    }
  }, [])

  const thisWeek = () => {
    const s = startOfWeek()
    const e = endOfWeek()
    dispatch({ type: 'set_week', week: { startDate: s, endDate: e, key: weekKey(s, e) } })
  }

  return (
    <div className="glass-panel p-4 neon-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-neon-cyan" />
          <div>
            <p className="text-white/80 text-sm">Período da semana</p>
            <p className="font-futuristic text-neon-blue">{display(state.currentWeek.startDate)} — {display(state.currentWeek.endDate)}</p>
          </div>
        </div>
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button className="button-neon" onClick={thisWeek}>Esta semana</button>
        </motion.div>
      </div>
    </div>
  )
}

