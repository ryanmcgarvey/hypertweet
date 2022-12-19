import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';
const Hyperbee = require('hyperbee')
const Hypercore = require('hypercore')

export default class Registry {
  rl: readline.Interface;
  client: any;

  store?: any;
  registryKey?: Buffer
  registryCore?: any;
  db?: any;

  public constructor(client: any) {
    this.client = client
    this.rl = readline.createInterface({ input, output });
  }

  public async ready() {
    // this.store = await this.client.corestore('registry')
    // this.registryCore = await this.store.get({ name: 'list', valueEncoding: 'utf-8' })
    this.registryCore = new Hypercore('./.registry')
    this.client.replicate(this.registryCore)
    this.db = new Hyperbee(this.registryCore, { keyEncoding: 'utf-8', valueEncoding: 'utf-8' })
    await this.db.ready()
    this.cmdPrompt()
  }

  async cmdPrompt() {
    this.rl.question('> ', async (line: string) => {
      let [arg1, arg2, arg3] = line.split(' ')
      switch (arg1) {
        case 'add':
          console.log('adding', arg2, arg3)
          await this.db.put(arg2, arg3)
          this.cmdPrompt()
          break;
        case 'get':
          console.log(await this.db.get(arg2))
          this.cmdPrompt()
          break;
        case 'key':
          console.log(this.registryCore.key.toString('hex'))
          this.cmdPrompt()
          break;
        default:
          console.log('unknown command')
          this.cmdPrompt()
      }
    });
  }

}
