const minimist = require('minimist')
const DHT = require('@hyperswarm/dht')
const Hyperswarm = require('hyperswarm')
const Corestore = require('corestore')
const Hyperbee = require('hyperbee')

// import Registry from './registry'

const privateRegistry = new Map<string, { publicKey: Buffer, secretKey: Buffer }>()

privateRegistry.set('ryan', {
  publicKey: Buffer.from('7712a459e4b51a65c13afe15febc7c5e96f04b1c5f2d39acf78eeb6808f5db0b', 'hex'),
  secretKey: Buffer.from('7ecd6252a34a53d63a0ff83570291ba6bdac7dd8d6a227422c31c341f2e1bc177712a459e4b51a65c13afe15febc7c5e96f04b1c5f2d39acf78eeb6808f5db0b', 'hex'),
})



async function main(name: string, registryKey: string) {
  const store = new Corestore(`./.storage/clients/${name}}`)
  await store.ready()
  const keyPair = privateRegistry.get(name)
  const publicMessages = store.get({ keyPair })
  await publicMessages.ready()


  console.log(`(public/disc) ${publicMessages.discoveryKey.toString('hex')}`)
  console.log(`(public/key) ${publicMessages.key.toString('hex')}`)


  const registryKeyPair = { publicKey: Buffer.from(registryKey, 'hex') }
  const registryCore = store.get({ keyPair: registryKeyPair })
  const registry = new Hyperbee(registryCore, { keyEncoding: 'utf-8', valueEncoding: 'json' })
  await registry.ready()

  const dht = new DHT({ keyPair })
  const swarm = new Hyperswarm({ dht, keyPair })

  swarm.on('connection', onconn)


  const discs = [
    swarm.join(registryKeyPair.publicKey, { server: false, client: true }),
    swarm.join(publicMessages.key, { server: true, client: false }),
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
  }
}
const { name, registry } = minimist(process.argv.slice(2))
main(name, registry)