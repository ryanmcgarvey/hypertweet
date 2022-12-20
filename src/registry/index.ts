const DHT = require('@hyperswarm/dht')
const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')
const Hyperbee = require('hyperbee')
import { buildCore, buildDb, getKeyFromDb, upsert } from "../util"

const registryKeyPair = {
  publicKey: Buffer.from('e0d77896a66537bfbcd0d3755ae35bbc49ca49b0cd98927f0283009c1b2ecf0f', 'hex'),
  secretKey: Buffer.from('9a92fe1af9c31a1171e6ae8ad849c53c021cb5155437f699f5866beb9548564de0d77896a66537bfbcd0d3755ae35bbc49ca49b0cd98927f0283009c1b2ecf0f', 'hex'),
}

async function main() {
  const store = new Corestore('./.storage/registry')
  await store.ready()

  const registryCore = store.get({ keyPair: registryKeyPair, keyEncoding: 'utf-8', valueEncoding: 'json' })
  await registryCore.ready()

  console.log(`(registry/disc) ${registryCore.discoveryKey.toString('hex')}`)
  console.log(`(registry/public) ${registryCore.key.toString('hex')}`)
  const registry = new Hyperbee(registryCore, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await registry.ready()

  const dht = new DHT({ keyPair: registryKeyPair })
  const swarm = new Hyperswarm({ dht, keyPair: registryKeyPair })

  swarm.on('connection', onconn)

  const discs = [
    swarm.join(registryCore.key, { server: true, client: false }),
  ]

  await Promise.all(discs.map((disc) => disc.flushed()))
  await swarm.flush()

  async function onconn(conn, peerinfo) {
    const { remotePublicKey: publicKey } = conn
    const keystr = publicKey.toString('hex')
    const keyPair = { publicKey }
    console.log(`(registry / connection) ${keystr.slice(0, 6)}`)
    store.replicate(conn)

    const profileCore = store.get(publicKey, { keyPair })
    await profileCore.ready()
    const profile = new Hyperbee(profileCore, { keyEncoding: 'utf-8', valueEncoding: 'json' })
    await profile.ready()
    let profileName = (await profile.get('name'))?.value.toString()

    if (profileName) {

      const existing = (await registry.get(profileName))?.value?.toString()
      if (existing) {
        console.log("(registry) Welcome BACK:", profileName)
      } else {
        console.log("(registry) Welcome:", profileName)
      }
      registry.put(profileName, { publicKey, keystr }, { cas: upsert })
    }


  }
}


main()