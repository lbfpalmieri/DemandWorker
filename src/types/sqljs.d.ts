declare module 'sql.js' {
  type LocateConfig = { locateFile?: (file: string) => string }
  type ExecResult = { columns: string[]; values: any[][] }
  interface Statement {
    run(params?: any[]): void
    free(): void
  }
  interface SQLDatabase {
    exec(sql: string, params?: any[]): ExecResult[]
    prepare(sql: string): Statement
    export(): Uint8Array
  }
  interface SQLJsStatic {
    Database: new (bytes?: Uint8Array) => SQLDatabase
  }
  const initSqlJs: (config?: LocateConfig) => Promise<SQLJsStatic>
  export default initSqlJs
}
