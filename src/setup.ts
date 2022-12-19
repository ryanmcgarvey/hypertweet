
const {
  Client: HyperspaceClient,
  Server: HyperspaceServer
} = require('hyperspace')

export default async function (host) {
  let client: any;
  let server: any;
  const storage = `./.hyperspace/${host}`

  server = new HyperspaceServer({ host, storage })
  await server.ready()
  client = new HyperspaceClient({ host })
  await client.ready()

  return {
    client,
    server,
    async cleanup() {
      await client.close()
      if (server) {
        console.log('Shutting down Hyperspace, this may take a few seconds...')
        await server.stop()
      }
    }
  }
}