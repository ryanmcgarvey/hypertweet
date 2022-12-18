const { Client } = require('hyperspace');

async function main() {
  const client = new Client();
  const store = client.corestore();
  const core1 = store.get({ valueEncoding: 'utf-8' })
  await core1.append(['hello', 'world']) // append 2 blocks

  // seed the hypercore
  await client.replicate(core1)
}

main().finally(() => {
  console.log("Done")
  process.exit()
});