const Hyperbee = require('hyperbee')
const crypto = require('hypercore-crypto')

export function upsert(prev: any, next: any) {
  return prev.value !== next.value
}

export async function buildCore({ store, opts, keyPair }: { store: any, opts?: any, keyPair?: any }) {
  keyPair = keyPair || await crypto.keyPair()
  opts = opts || {}
  const core = store.get({ keyPair, ...opts })
  await core.ready()
  return { core, keyPair }
}

export async function buildDb({ store, keyPair }: { store: any, keyPair?: any }) {
  const { core, keyPair: kp } = await buildCore({ store, keyPair, opts: { valueEncoding: 'json', keyEncoding: 'utf-8' } })
  keyPair = kp
  const db = new Hyperbee(core, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await db.ready()
  return { core, keyPair, db }
}

export async function getKeyFromDb(db: any, key: string) {
  const res = await db.get(key)
  const v = res?.value
  if (!v) return
  return {
    publicKey: Buffer.from(v.publicKey),
    secretKey: Buffer.from(v.secretKey),
  }
}
