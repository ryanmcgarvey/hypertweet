import setupHyperspace from './setup'
import Tweeter from './tweet'

async function main(args: string[]) {
  const { client, cleanup } = await setupHyperspace()
  const user = args[0]
  const t = new Tweeter(client, user)
  await t.ready()

  process.on('SIGINT', cleanup)
}


main(process.argv.slice(2))