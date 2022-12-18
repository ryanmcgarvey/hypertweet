import setupHyperspace from './setup'
import Tweeter from './tweet'

async function main() {
  // Setup the Hyperspace Daemon connection
  // =
  const { client, cleanup } = await setupHyperspace()
  console.log('Hyperspace daemon connected, status:')
  console.log(await client.status())

  const t = new Tweeter(client)
  await t.ready()

  process.on('SIGINT', cleanup)
}


main()