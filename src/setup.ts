
const {
  Client: HyperspaceClient,
  Server: HyperspaceServer
} = require('hyperspace')

export default async function () {
  let client: any;
  let server: any;

  try {
    client = new HyperspaceClient()
    await client.ready()
  } catch (e) {
    // no daemon, start it in-process
    server = new HyperspaceServer()
    await server.ready()
    client = new HyperspaceClient()
    await client.ready()
  }

  return {
    client,
    async cleanup() {
      await client.close()
      if (server) {
        console.log('Shutting down Hyperspace, this may take a few seconds...')
        await server.stop()
      }
    }
  }
}