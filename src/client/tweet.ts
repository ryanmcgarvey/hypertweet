import * as readline from 'node:readline';
import { exit, stdin as input, stdout as output } from 'node:process';
const Hypberbee = require('hyperbee')


const REGISTRY_KEY = '3de8ec44d4529e7565627ed0f45095cbf296a16002ef9e5f8ce1814d88c1656c'
export default class Tweeter {
  user: string;
  client?: any;
  store?: any;
  userCore?: any;
  rl: readline.Interface
  cores: Map<string, any> = new Map()
  keys: Map<string, string> = new Map()
  registryCore?: any;
  registry: any;
  constructor(client: any, user: string) {
    this.client = client
    this.user = user
    this.rl = readline.createInterface({ input, output });
  }

  async ready() {
    this.store = this.client.corestore()
    this.userCore = this.store.get({ name: 'tweets', valueEncoding: 'json' })
    await this.client.replicate(this.userCore)

    this.registryCore = this.store.get({ key: Buffer.from(REGISTRY_KEY, 'hex'), valueEncoding: 'utf-8' })
    // await this.client.replicate(this.registryCore)


    await this.client.network.configure(this.userCore, { announce: false, lookup: true })

    this.registry = new Hypberbee(this.registryCore, { keyEncoding: 'utf-8', valueEncoding: 'utf-8' })
    await this.registry.ready()

    this.cmdPrompt()
  }

  async cmdPrompt() {
    this.rl.question('> ', async (line: string) => {
      let [arg1, arg2, arg3] = line.split(' ')
      let coreToUse: any
      let value;
      switch (arg1) {
        case 'lookup':
          value = await this.registry.get(arg2)
          console.log("key", value)
        case 'key':
          console.log(this.userCore.key.toString('hex'))
          this.cmdPrompt()
          break;
        case 'follow':
          coreToUse = await this.getCoreFromKey(arg3)
          this.keys.set(arg2, arg3)
          this.cores.set(arg2, coreToUse)
          console.log("following", arg2)
          this.cmdPrompt()
          break;
        case 'exit':
          this.rl.close();
          exit(0);
        case 'list':
          if (coreToUse = await this.getCoreFromName(arg2)) {
            this.printCore(coreToUse)
          } else {
            console.log('core not found')
          }
          this.cmdPrompt()
          break;
        case 'tweet':
          coreToUse = await this.getCoreFromName(arg2)
          this.tweet(coreToUse)
          break
        default:
          console.log('unknown command')
          this.cmdPrompt()
      }
    });
  }

  async getCoreFromName(coreName: string) {
    return this.cores.get(coreName) || this.userCore
  }

  async getCoreFromKey(key: string) {
    const core = this.store.get({ key: Buffer.from(key, 'hex') })
    if (!core) {
      return
    }
    await this.client.replicate(core)
    return core;
  }

  async tweet(core: any) {
    this.rl.question('What would you like to say?\n> ', (line: string) => {
      core.append({ date: new Date(), data: line })
      this.cmdPrompt()
    });
  }

  async printCore(core: any) {
    console.log('tweets:', core.length)
    for (let i = 0; i < core.length; i++) {
      const tweet = await core.get(i)
      console.log(`${tweet.date}: ${tweet.data}`)
    }
  }
}