import initSqlJs from 'sql.js'
import type { Demand, Week } from '../types'

let _db: any
let _ready: Promise<void> | null = null

const locate = (file: string) => `https://cdn.jsdelivr.net/npm/sql.js/dist/${file}`

async function getHandle() {
  const root = await (navigator as any).storage.getDirectory()
  // @ts-ignore
  const fh = await root.getFileHandle('demandworker.sqlite', { create: true })
  return fh
}

async function loadBytes() {
  const fh = await getHandle()
  const f = await fh.getFile()
  const buf = await f.arrayBuffer()
  return new Uint8Array(buf)
}

async function saveBytes(bytes: Uint8Array) {
  const fh = await getHandle()
  // @ts-ignore
  const ws = await fh.createWritable()
  await ws.write(bytes)
  await ws.close()
}

async function ensureSchema() {
  _db.exec(
    `CREATE TABLE IF NOT EXISTS weeks (id TEXT PRIMARY KEY, start_date TEXT, end_date TEXT, key TEXT UNIQUE, created_at TEXT);
     CREATE TABLE IF NOT EXISTS demands (id TEXT PRIMARY KEY, titulo TEXT, descricao TEXT, cliente TEXT, prioridade TEXT, data_inclusao TEXT, status TEXT, semana_key TEXT, carregada INTEGER, ordem INTEGER);
     CREATE TABLE IF NOT EXISTS meta_kv (key TEXT PRIMARY KEY, value TEXT);
     CREATE INDEX IF NOT EXISTS idx_demands_week_status ON demands(semana_key, status);
     CREATE INDEX IF NOT EXISTS idx_demands_client_status ON demands(cliente, status);
     CREATE INDEX IF NOT EXISTS idx_demands_ordem ON demands(ordem);
     CREATE UNIQUE INDEX IF NOT EXISTS idx_weeks_key ON weeks(key);`
  )
  try {
    _db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS demands_fts USING fts5(id, titulo, descricao)`)
    const exists = _db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='demands_fts'")
    if (exists.length) {
      _db.exec('DELETE FROM demands_fts')
      _db.exec('INSERT INTO demands_fts(id,titulo,descricao) SELECT id,titulo,descricao FROM demands')
    }
  } catch {}
}

export async function initDb() {
  if (_db) return _db
  if (!_ready) {
    _ready = (async () => {
      const SQL = await initSqlJs({ locateFile: locate })
      let bytes: Uint8Array | null = null
      try { bytes = await loadBytes() } catch { bytes = null }
      _db = bytes && bytes.length ? new SQL.Database(bytes) : new SQL.Database()
      await ensureSchema()
      await saveBytes(_db.export())
    })()
  }
  await _ready
  return _db
}

export async function fetchDemands(): Promise<Demand[]> {
  await initDb()
  const res = _db.exec('SELECT * FROM demands ORDER BY ordem DESC')
  if (!res.length) return []
  const row = res[0]
  return row.values.map((v: any[]) => ({
    id: v[row.columns.indexOf('id')],
    titulo: v[row.columns.indexOf('titulo')],
    descricao: v[row.columns.indexOf('descricao')] ?? undefined,
    cliente: v[row.columns.indexOf('cliente')],
    prioridade: v[row.columns.indexOf('prioridade')],
    dataInclusao: v[row.columns.indexOf('data_inclusao')],
    status: v[row.columns.indexOf('status')],
    semanaKey: v[row.columns.indexOf('semana_key')],
    carregada: !!v[row.columns.indexOf('carregada')],
    ordem: v[row.columns.indexOf('ordem')],
  }))
}

export async function replaceDemands(list: Demand[]): Promise<void> {
  await initDb()
  _db.exec('DELETE FROM demands')
  const stmt = _db.prepare('INSERT INTO demands (id,titulo,descricao,cliente,prioridade,data_inclusao,status,semana_key,carregada,ordem) VALUES (?,?,?,?,?,?,?,?,?,?)')
  list.forEach(d => {
    stmt.run([d.id, d.titulo, d.descricao ?? null, d.cliente, d.prioridade, d.dataInclusao, d.status, d.semanaKey, d.carregada ? 1 : 0, d.ordem ?? Date.now()])
  })
  stmt.free()
  try {
    _db.exec('DELETE FROM demands_fts')
    _db.exec('INSERT INTO demands_fts(id,titulo,descricao) SELECT id,titulo,descricao FROM demands')
  } catch {}
  await saveBytes(_db.export())
}

export async function fetchWeeks(): Promise<Week[]> {
  await initDb()
  const res = _db.exec('SELECT start_date as startDate, end_date as endDate, key FROM weeks ORDER BY start_date DESC')
  if (!res.length) return []
  const row = res[0]
  return row.values.map((v: any[]) => ({
    startDate: v[row.columns.indexOf('startDate')],
    endDate: v[row.columns.indexOf('endDate')],
    key: v[row.columns.indexOf('key')],
  }))
}

export async function replaceWeeks(list: Week[]): Promise<void> {
  await initDb()
  _db.exec('DELETE FROM weeks')
  const stmt = _db.prepare('INSERT INTO weeks (id,start_date,end_date,key,created_at) VALUES (?,?,?,?,?)')
  list.forEach(w => {
    stmt.run([crypto.randomUUID(), w.startDate, w.endDate, w.key, new Date().toISOString()])
  })
  stmt.free()
  await saveBytes(_db.export())
}

export async function fetchCurrentWeek(): Promise<Week | null> {
  await initDb()
  const res = _db.exec("SELECT value FROM meta_kv WHERE key='current_week' LIMIT 1")
  if (!res.length) return null
  const v = res[0].values[0][0]
  return JSON.parse(v)
}

export async function saveCurrentWeekDB(w: Week): Promise<void> {
  await initDb()
  const s = JSON.stringify(w)
  const stmt = _db.prepare("INSERT OR REPLACE INTO meta_kv(key,value) VALUES('current_week', ?)")
  stmt.run([s])
  stmt.free()
  await saveBytes(_db.export())
}

export async function searchDemandIds(query: string): Promise<string[]> {
  await initDb()
  const q = query.trim()
  if (!q) return []
  try {
    const res = _db.exec('SELECT id FROM demands_fts WHERE demands_fts MATCH ?', [q])
    if (!res.length) {
      const like = `%${q}%`
      const fb = _db.exec('SELECT id FROM demands WHERE titulo LIKE ? OR descricao LIKE ? OR cliente LIKE ?', [like, like, like])
      if (!fb.length) return []
      const rowFb = fb[0]
      return rowFb.values.map((v: any[]) => v[rowFb.columns.indexOf('id')])
    }
    const row = res[0]
    return row.values.map((v: any[]) => v[row.columns.indexOf('id')])
  } catch {
    const like = `%${q}%`
    const res = _db.exec('SELECT id FROM demands WHERE titulo LIKE ? OR descricao LIKE ? OR cliente LIKE ?', [like, like, like])
    if (!res.length) return []
    const row = res[0]
    return row.values.map((v: any[]) => v[row.columns.indexOf('id')])
  }
}

export async function setCurrentWeekAndCarry(next: Week, prevKey: string): Promise<void> {
  await initDb()
  const stmt = _db.prepare('INSERT OR IGNORE INTO weeks (id,start_date,end_date,key,created_at) VALUES (?,?,?,?,?)')
  stmt.run([crypto.randomUUID(), next.startDate, next.endDate, next.key, new Date().toISOString()])
  stmt.free()
  const s = JSON.stringify(next)
  const meta = _db.prepare("INSERT OR REPLACE INTO meta_kv(key,value) VALUES('current_week', ?)")
  meta.run([s])
  meta.free()
  const upd = _db.prepare("UPDATE demands SET semana_key=?, status='urgente', carregada=1 WHERE semana_key=? AND status!='concluida'")
  upd.run([next.key, prevKey])
  upd.free()
  await saveBytes(_db.export())
}

export async function getKV(key: string): Promise<string | null> {
  await initDb()
  const res = _db.exec('SELECT value FROM meta_kv WHERE key=? LIMIT 1', [key])
  if (!res.length) return null
  return res[0].values[0][0] ?? null
}

export async function setKV(key: string, value: string): Promise<void> {
  await initDb()
  const stmt = _db.prepare('INSERT OR REPLACE INTO meta_kv(key,value) VALUES(?,?)')
  stmt.run([key, value])
  stmt.free()
  await saveBytes(_db.export())
}

export async function resetDatabase(): Promise<void> {
  await initDb()
  try {
    _db.exec('DELETE FROM demands; DELETE FROM weeks; DELETE FROM meta_kv;')
    try { _db.exec('DELETE FROM demands_fts') } catch {}
    await saveBytes(_db.export())
  } catch {}
}
