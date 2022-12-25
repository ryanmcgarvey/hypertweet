/// <reference types="node" />
/// <reference types="node" />
import * as readline from 'node:readline';
export default class Registry {
    rl: readline.Interface;
    client: any;
    store?: any;
    registryKey?: Buffer;
    registryCore?: any;
    db?: any;
    constructor(client: any);
    ready(): Promise<void>;
    cmdPrompt(): Promise<void>;
}
