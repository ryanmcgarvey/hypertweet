import { buildCore, buildDb, getKeyFromDb, upsert } from "../util"
import Tweeter from "./tweet"
const minimist = require('minimist')
const DHT = require('@hyperswarm/dht')
const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')
const Hyperbee = require('hyperbee')
const cyrpto = require('hypercore-crypto')

const DEFAULT_REGISTRY = 'e0d77896a66537bfbcd0d3755ae35bbc49ca49b0cd98927f0283009c1b2ecf0f'

const privateRegistry = new Map<string, { publicKey: Buffer, secretKey: Buffer }>()
privateRegistry.set('ryan', {
  publicKey: Buffer.from('7712a459e4b51a65c13afe15febc7c5e96f04b1c5f2d39acf78eeb6808f5db0b', 'hex'),
  secretKey: Buffer.from('7ecd6252a34a53d63a0ff83570291ba6bdac7dd8d6a227422c31c341f2e1bc177712a459e4b51a65c13afe15febc7c5e96f04b1c5f2d39acf78eeb6808f5db0b', 'hex'),
})
privateRegistry.set('bob', {
  publicKey: Buffer.from('87b546caf5ed6810ee6e59a5760c7024a7ea3e4ebd0b31df687444e7141b80a9', 'hex'),
  secretKey: Buffer.from('96a31134fd03a816e8bd0ed00414ea9244440e3bcc42a9a226209d451d26591287b546caf5ed6810ee6e59a5760c7024a7ea3e4ebd0b31df687444e7141b80a9', 'hex'),
})

async function main(name: string, registryKey?: string) {
  const store = new Corestore(`./.storage/clients/${name}}`)
  await store.ready()

  const configKeyPair = privateRegistry.get(name) || cyrpto.keyPair()
  console.log("public key: ", configKeyPair?.publicKey.toString("hex"))
  console.log("secret key", configKeyPair?.secretKey.toString("hex"))




  const { db: config } = await buildDb({ store, keyPair: configKeyPair })
  const { db: profile, keyPair: profileKeyPair } = await buildDb({ store, keyPair: await getKeyFromDb(config, 'profileKeyPair') })
  config.put('profileKeyPair', profileKeyPair, { cas: upsert })


  const { core: publicMessages, keyPair: publicMessagesKeyPair } = await buildCore({ store, keyPair: await getKeyFromDb(config, 'publicMessagesKeyPair'), opts: { valueEncoding: 'json' } })
  config.put('publicMessagesKeyPair', publicMessagesKeyPair, { cas: upsert })
  profile.put('publicMessageKey', publicMessagesKeyPair.publicKey, { cas: upsert })
  console.log({ name })
  profile.put('name', name, { cas: upsert })
  if (!await profile.get('follows')) {
    profile.put('follows', [], { cas: upsert })
  }



  registryKey = registryKey || DEFAULT_REGISTRY
  const registryKeyPair = { publicKey: Buffer.from(registryKey, 'hex') }
  const registryCore = store.get({ keyPair: registryKeyPair })
  const registry = new Hyperbee(registryCore, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await registry.ready()

  const dht = new DHT({ keyPair: profileKeyPair })
  const swarm = new Hyperswarm({ dht, keyPair: profileKeyPair })

  swarm.on('connection', onconn)

  const discs = [
    swarm.join(registryKeyPair.publicKey, { server: false, client: true }),
    swarm.join(profileKeyPair.publicKey, { server: true, client: false }),
    swarm.join(publicMessagesKeyPair.publicKey, { server: true, client: false }),
  ]

  await Promise.all(discs.map((disc) => disc.flushed()))
  await swarm.flush()

  async function onconn(conn, peerinfo) {
    console.log("connection")
    const { remotePublicKey: publicKey } = conn
    const keystr = publicKey.toString('hex')
    const keyPair = { publicKey }

    console.log(`(client / connection) ${keystr.slice(0, 6)}`)
    store.replicate(conn)

    await registry.feed.update()
    const range = registry.feed.download({ start: 0, end: registry.feed.length })
    await range.done()
  }

  const t = new Tweeter({ store, userCore: publicMessages, user: name, registry, swarm, profile })
  await t.ready()
}
const { name, registry } = minimist(process.argv.slice(2))
main(name, registry)