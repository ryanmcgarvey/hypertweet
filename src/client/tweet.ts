import * as readline from 'node:readline';
import { exit, stdin as input, stdout as output } from 'node:process';
import { buildCore, buildDb, getKeyFromDb, upsert } from "../util"

type follow = {
  name: string,
  publicKey: Buffer,
}
export default class Tweeter {
  rl: readline.Interface

  user: string;
  store: any;
  userCore: any;
  registry: any;
  profile: any;
  swarm: any;
  follows: any[];

  constructor({ profile, swarm, store, userCore, registry, user }: { profile, swarm: any, store: any, userCore: any, registry: any, user: string }) {
    this.user = user
    this.swarm = swarm
    this.store = store
    this.registry = registry
    this.userCore = userCore
    this.profile = profile
    this.rl = readline.createInterface({ input, output });
  }

  async ready() {
    this.follows = (await this.profile.get('follows'))?.value as follow[]
    console.log("Following:")
    for await (const user of this.follows) {
      console.log(user.name)
      const core = this.messagesCoreFromName(user.name)
      this.printCore(core)
    }
    this.cmdPrompt()
  }

  async cmdPrompt() {
    this.rl.question('> ', async (line: string) => {
      let [arg1, arg2] = line.split(' ')
      let coreToUse: any
      switch (arg1) {
        case 'key':
          console.log(this.userCore.key.toString('hex'))
          this.cmdPrompt()
          break;
        case 'follow':
          if (arg2) {
            if (coreToUse = await this.messagesCoreFromName(arg2)) {
              this.follows.push({ name: arg2, publicKey: coreToUse.key })
              this.profile.put('follows', this.follows)
              this.printCore(coreToUse)
            } else {
              console.log('user not found')
            }
          }
          this.cmdPrompt()
          break;
        case 'list':
          const nameToFetch = arg2 || this.user
          if (coreToUse = await this.messagesCoreFromName(nameToFetch)) {
            this.printCore(coreToUse)
          } else {
            console.log('user not fond')
          }
          this.cmdPrompt()
          break;
        case 'tweet':
          this.tweet(this.userCore)
          break
        case 'exit':
          this.rl.close();
          exit(0);
        default:
          console.log('unknown command')
          this.cmdPrompt()
      }
    });
  }

  async messagesCoreFromName(name: string) {
    console.log("listing", name)

    const key = (await this.registry.get(name))?.value
    if (!key) {
      console.log("no key found for", name)
      return
    }
    const profile = await buildDb({ store: this.store, keyPair: { publicKey: Buffer.from(key.publicKey) } })

    const messagesKeyRaw = (await profile.db.get('publicMessageKey'))?.value
    if (!messagesKeyRaw) {
      console.log("no messages key found for", name)
      return
    }
    const { core: messages } = await buildCore({ store: this.store, keyPair: { publicKey: Buffer.from(messagesKeyRaw) }, opts: { valueEncoding: 'json' } })
    const disc = this.swarm.join(messages.key, { server: false, client: true })
    disc.flushed()
    this.swarm.flush()
    await messages.ready()
    return messages
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