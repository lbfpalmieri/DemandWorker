import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(isoWeek)

export const fmt = (d: Date | string) => dayjs(d).format('YYYY-MM-DD')
export const weekKey = (start: string, end: string) => `${start}_${end}`
export const startOfWeek = (d = new Date()) => dayjs(d).isoWeekday(1).startOf('day').format('YYYY-MM-DD')
export const endOfWeek = (d = new Date()) => dayjs(d).isoWeekday(7).endOf('day').format('YYYY-MM-DD')
export const display = (d: string) => dayjs(d).format('DD/MM/YYYY')

