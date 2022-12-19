import * as readline from 'node:readline';
import { exit, stdin as input, stdout as output } from 'node:process';
import { userConfigKey, updateUserConfigKey } from './user_config';


export default class Tweeter {
  user: string;

  client?: any;
  store?: any;
  userConfigKey?: Buffer
  userCore?: any;
  rl: readline.Interface
  constructor(client: any, user: string) {
    this.client = client
    this.user = user
    this.rl = readline.createInterface({ input, output });
  }

  async ready() {
    this.store = this.client.corestore(`./.users/${this.user}`)
    this.userConfigKey = userConfigKey(this.user)

    if (this.userConfigKey) {
      this.userCore = this.store.get({ key: this.userConfigKey, valueEncoding: 'json' })
    } else {
      this.userCore = this.store.get({ valueEncoding: 'json' })
    }
    await this.client.replicate(this.userCore)
    this.userConfigKey = this.userCore.key
    updateUserConfigKey(this.user, this.userCore.key)
    return this.cmdPrompt()
  }

  async cmdPrompt() {
    this.rl.question('> ', async (line: string) => {
      switch (line) {
        case 'exit':
          this.rl.close();
          exit(0);
          break;
        case 'list':
          console.log('tweets:', this.userCore.length)
          for (let i = 0; i < this.userCore.length; i++) {
            const tweet = await this.userCore.get(i)
            console.log(`${tweet.date}: ${tweet.data}`)
          }
          this.cmdPrompt()
          break;
        case 'tweet':
          this.tweet()
          break
        default:
          console.log('unknown command')
          this.cmdPrompt()
      }
    });
  }

  async tweet() {
    this.rl.question('What would you like to say?\n> ', (line: string) => {
      this.userCore.append({ date: new Date(), data: line })
      this.cmdPrompt()
    });
  }
}