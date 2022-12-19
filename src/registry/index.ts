import setupHyperspace from '../setup'
import Registry from './registry'

Error.stackTraceLimit = Infinity;

async function main() {
  const { client, cleanup } = await setupHyperspace('registry')
  await client.ready()
  const r = new Registry(client)
  await r.ready()

  process.on('SIGINT', cleanup)
}


main()