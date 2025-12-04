import { useDemand } from './DemandContext'
import type { Demand, Week, Priority, Status } from '@types'

export const useWeek = () => {
  const { state, dispatch } = useDemand()
  return {
    currentWeek: state.currentWeek,
    weeks: state.weeks,
    setWeek: (week: Week) => dispatch({ type: 'set_week', week }),
  }
}

export const useDemands = () => {
  const { state, dispatch } = useDemand()
  const listAll = state.demands
  const listCurrent = listAll.filter(d => d.semanaKey === state.currentWeek.key)
  return {
    all: listAll,
    current: listCurrent,
    add: (payload: Omit<Demand, 'id' | 'dataInclusao'>) => dispatch({ type: 'add_demand', demand: payload }),
    edit: (id: string, changes: Partial<Omit<Demand, 'id' | 'dataInclusao'>>) => dispatch({ type: 'edit_demand', id, changes }),
    remove: (id: string) => dispatch({ type: 'delete_demand', id }),
    setStatus: (id: string, status: Status) => dispatch({ type: 'toggle_status', id, status }),
    moveToWeek: (id: string, semanaKey: string) => dispatch({ type: 'move_to_week', id, semanaKey }),
    setPriority: (id: string, prioridade: Priority) => dispatch({ type: 'edit_demand', id, changes: { prioridade } }),
    setClient: (id: string, cliente: string) => dispatch({ type: 'edit_demand', id, changes: { cliente } }),
  }
}

export const useFilters = () => {
  const { state, dispatch } = useDemand()
  return {
    cliente: state.filterCliente,
    setCliente: (c: string | null) => dispatch({ type: 'set_filter', cliente: c })
  }
}

export const useSettings = () => {
  const { state, dispatch } = useDemand()
  return {
    settings: state.settings,
    setSettings: (s: Partial<{ autoAdvance: boolean }>) => dispatch({ type: 'set_settings', settings: s })
  }
}

export const useClients = () => {
  const { state, dispatch } = useDemand()
  return {
    list: state.clients,
    setAll: (clients: string[]) => dispatch({ type: 'set_clients', clients }),
    add: (nome: string) => dispatch({ type: 'add_client', nome }),
    rename: (from: string, to: string) => dispatch({ type: 'edit_client', from, to }),
    remove: (nome: string) => dispatch({ type: 'delete_client', nome }),
  }
}
