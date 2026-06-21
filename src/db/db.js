import Dexie from 'dexie'

export const db = new Dexie('PresupuestoDB')

db.version(1).stores({
  transacciones: '++id, tipo, monto, moneda, categoria, fecha, origen',
  config: '++id'
})

export default db