import { getKey, updateKey } from "../key_storage";

export default class Registry {
  client?: any;
  store?: any;
  registryKey?: Buffer
  registryCore?: any;

  public constructor(client: any) {
    this.client = client
  }

  public async ready() {
    this.store = await this.client.corestore(`./.registry`)
    this.registryKey = getKey('./.registry/registryKey')
    this.registryCore = await this.store.get({ key: this.registryKey, valueEncoding: 'json' })
    await this.client.replicate(this.registryCore)
    this.registryKey = this.registryCore.key
    updateKey('./.registry', 'registryKey', this.registryCore.key)

    this.registryCore.on('peer-add', (peer: any) => {
      console.log('peer added', peer)
    })
  }
}
