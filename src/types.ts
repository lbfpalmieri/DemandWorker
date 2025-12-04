export type Priority = 'baixa' | 'media' | 'alta'
export type Status = 'nao_concluida' | 'concluida' | 'urgente'

export type Week = {
  startDate: string
  endDate: string
  key: string
}

export type Demand = {
  id: string
  titulo: string
  descricao?: string
  cliente: string
  prioridade: Priority
  dataInclusao: string
  status: Status
  semanaKey: string
  carregada?: boolean
  ordem?: number
}

