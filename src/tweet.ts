import * as readline from 'node:readline';
import { stdin as input, stdout as output } from 'node:process';



export default class Tweeter {
  client: any;
  rl: readline.Interface
  constructor(client: any) {
    this.client = client
    this.rl = readline.createInterface({ input, output });
  }

  async ready() {
    return this.cmdPrompt()
  }

  async cmdPrompt() {
    this.rl.question('> ', (line: string) => {
      switch (line) {
        case 'exit':
          this.rl.close();
          break;
        case 'feed':
          console.log('feed')
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
    this.rl.question('What would you like to say?', (line: string) => {
      console.log(`You said: ${line}`);
      this.cmdPrompt()
    });
  }
}