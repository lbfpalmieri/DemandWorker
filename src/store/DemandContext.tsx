import React, { createContext, useContext, useMemo, useReducer } from 'react'
import type { Demand, Week, Status } from '@types'
import { fetchDemands, fetchWeeks, fetchCurrentWeek, replaceDemands, replaceWeeks, saveCurrentWeekDB, setCurrentWeekAndCarry, resetDatabase, getKV, setKV } from '../db/sqlite'
import { loadClients, saveClients } from '@utils/storage'
import { weekKey as wk, startOfWeek, endOfWeek } from '@utils/date'

type Settings = { autoAdvance: boolean }

type State = {
  demands: Demand[]
  weeks: Week[]
  currentWeek: Week
  filterCliente: string | null
  settings: Settings
  clients: string[]
}

type Action =
  | { type: 'hydrate', weeks: Week[], currentWeek: Week, demands: Demand[], filterCliente: string | null, settings: Settings, clients?: string[] }
  | { type: 'set_week', week: Week }
  | { type: 'advance_week_auto' }
  | { type: 'add_demand', demand: Omit<Demand, 'id' | 'dataInclusao'> }
  | { type: 'edit_demand', id: string, changes: Partial<Omit<Demand, 'id' | 'dataInclusao'>> }
  | { type: 'delete_demand', id: string }
  | { type: 'toggle_status', id: string, status: Status }
  | { type: 'set_filter', cliente: string | null }
  | { type: 'set_settings', settings: Partial<Settings> }
  | { type: 'move_to_week', id: string, semanaKey: string }
  | { type: 'set_clients', clients: string[] }
  | { type: 'add_client', nome: string }
  | { type: 'edit_client', from: string, to: string }
  | { type: 'delete_client', nome: string }

const defaultWeek: Week = {
  startDate: startOfWeek(),
  endDate: endOfWeek(),
  key: wk(startOfWeek(), endOfWeek()),
}

const DemandCtx = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'hydrate': {
      const clients = action.clients ?? state.clients
      return { ...state, weeks: action.weeks, currentWeek: action.currentWeek, demands: action.demands, filterCliente: action.filterCliente, settings: action.settings, clients }
    }
    case 'set_week': {
      const prev = state.currentWeek
      const next = action.week
      const weeks = [...state.weeks]
      if (!weeks.find(w => w.key === next.key)) weeks.push(next)

      let demands = [...state.demands]
      const prevOpen = demands.filter(d => d.semanaKey === prev.key && d.status !== 'concluida')
      const carry = prevOpen.map(d => ({ ...d, semanaKey: next.key, status: 'urgente' as Status, carregada: true }))
      demands = demands
        .filter(d => !(d.semanaKey === prev.key && d.status !== 'concluida'))
        .concat(carry)

      try { replaceWeeks(weeks) } catch {}
      try { setCurrentWeekAndCarry(next, prev.key) } catch {}
      try { saveCurrentWeekDB(next) } catch {}
      return { ...state, weeks, demands, currentWeek: next }
    }
    case 'advance_week_auto': {
      const now = new Date()
      const currentEnd = new Date(state.currentWeek.endDate)
      if (now <= currentEnd) return state
      const start = startOfWeek(now)
      const end = endOfWeek(now)
      const next: Week = { startDate: start, endDate: end, key: wk(start, end) }
      return reducer(state, { type: 'set_week', week: next })
    }
    case 'add_demand': {
      const id = crypto.randomUUID()
      const demand: Demand = {
        id,
        dataInclusao: new Date().toISOString(),
        ordem: Date.now(),
        ...action.demand,
      }
      const demands = [demand, ...state.demands]
      try { replaceDemands(demands) } catch {}
      return { ...state, demands }
    }
    case 'edit_demand': {
      const demands = state.demands.map(d => d.id === action.id ? { ...d, ...action.changes } : d)
      try { replaceDemands(demands) } catch {}
      return { ...state, demands }
    }
    case 'delete_demand': {
      const demands = state.demands.filter(d => d.id !== action.id)
      try { replaceDemands(demands) } catch {}
      return { ...state, demands }
    }
    case 'toggle_status': {
      const demands = state.demands.map(d => d.id === action.id ? { ...d, status: action.status } : d)
      try { replaceDemands(demands) } catch {}
      return { ...state, demands }
    }
    case 'set_filter': {
      try { setKV('dw_filterCliente', JSON.stringify(action.cliente)) } catch {}
      return { ...state, filterCliente: action.cliente }
    }
    case 'set_settings': {
      const settings = { ...state.settings, ...action.settings }
      try { setKV('dw_settings', JSON.stringify(settings)) } catch {}
      return { ...state, settings }
    }
    case 'move_to_week': {
      const demands = state.demands.map(d => d.id === action.id ? { ...d, semanaKey: action.semanaKey } : d)
      try { replaceDemands(demands) } catch {}
      return { ...state, demands }
    }
    case 'set_clients': {
      const list = Array.from(new Set(action.clients.map(s => s.trim()).filter(Boolean))).sort((a,b) => a.localeCompare(b))
      saveClients(list)
      return { ...state, clients: list }
    }
    case 'add_client': {
      const list = Array.from(new Set([...state.clients, action.nome.trim()].filter(Boolean))).sort((a,b) => a.localeCompare(b))
      saveClients(list)
      return { ...state, clients: list }
    }
    case 'edit_client': {
      const list = state.clients.map(c => c === action.from ? action.to.trim() : c).filter(Boolean)
      const unique = Array.from(new Set(list)).sort((a,b) => a.localeCompare(b))
      saveClients(unique)
      const demands = state.demands.map(d => d.cliente === action.from ? { ...d, cliente: action.to.trim() } : d)
      try { replaceDemands(demands) } catch {}
      return { ...state, clients: unique, demands }
    }
    case 'delete_client': {
      const list = state.clients.filter(c => c !== action.nome)
      saveClients(list)
      return { ...state, clients: list }
    }
    default:
      return state
  }
}

export const DemandProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, {
    demands: [],
    weeks: [],
    currentWeek: defaultWeek,
    filterCliente: null,
    settings: JSON.parse(localStorage.getItem('dw_settings') || '{"autoAdvance":true}') as Settings,
    clients: loadClients(),
  })

  React.useEffect(() => {
    (async () => {
      try {
        if (localStorage.getItem('dw_reset_done') !== 'true') {
          localStorage.clear()
          await resetDatabase()
          localStorage.setItem('dw_reset_done', 'true')
        }
      } catch {}
      const filterKV = await getKV('dw_filterCliente')
      const settingsKV = await getKV('dw_settings')
      const filterCliente = filterKV ? JSON.parse(filterKV) : null
      const weeks = await fetchWeeks()
      let cw = await fetchCurrentWeek()
      if (!cw) {
        const start = startOfWeek()
        const end = endOfWeek()
        cw = { startDate: start, endDate: end, key: wk(start, end) }
        await replaceWeeks(weeks.length ? weeks : [cw])
        await saveCurrentWeekDB(cw)
      }
      const demands = await fetchDemands()
      const settings: Settings = settingsKV ? JSON.parse(settingsKV) : { autoAdvance: true }
      const savedClients = loadClients()
      const seeded = savedClients.length ? savedClients : Array.from(new Set(demands.map(d => d.cliente))).sort((a,b) => a.localeCompare(b))
      if (seeded.length && !savedClients.length) saveClients(seeded)
      dispatch({ type: 'hydrate', weeks: weeks.length ? weeks : [cw], currentWeek: cw, demands, filterCliente, settings, clients: seeded })
    })()
  }, [])

  React.useEffect(() => {
    (async () => {
      const demands = await fetchDemands()
      dispatch({ type: 'hydrate', weeks: state.weeks, currentWeek: state.currentWeek, demands, filterCliente: state.filterCliente, settings: state.settings, clients: state.clients })
    })()
  }, [state.currentWeek.key])

  React.useEffect(() => {
    if (!state.settings.autoAdvance) return
    const id = setInterval(() => { dispatch({ type: 'advance_week_auto' }) }, 60 * 1000)
    return () => clearInterval(id)
  }, [state.settings.autoAdvance])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <DemandCtx.Provider value={value}>{children}</DemandCtx.Provider>
}

export const useDemand = () => {
  const ctx = useContext(DemandCtx)
  if (!ctx) throw new Error('DemandContext ausente')
  return ctx
}

