import setupHyperspace from '../setup'
import Tweeter from './tweet'

async function main(args: string[]) {
  const user = args[0]
  const { client, cleanup } = await setupHyperspace(user)
  await client.ready()
  const t = new Tweeter(client, user)
  await t.ready()

  process.on('SIGINT', cleanup)
}


main(process.argv.slice(2))