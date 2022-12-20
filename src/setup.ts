import Corestore from 'corestore'
import minimist from 'minimist'
import crypto from 'hypercore-crypto'
import DHT from '@hyperswarm/dht'
import Hyperswarm from 'hyperswarm'
import Hyperbee from 'hyperbee'

export default async function (host) {
  const storage = `./.storage/${host}`
  const store = new Corestore()

  return {}
}