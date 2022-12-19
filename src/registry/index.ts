import setupHyperspace from '../setup'
import Registry from './registry'

async function main() {
  const { client, cleanup, server } = await setupHyperspace()
  const r = new Registry(client)
  await r.ready()

  process.on('SIGINT', cleanup)
}


main()