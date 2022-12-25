/// <reference types="node" />
import * as readline from 'node:readline';
export default class Tweeter {
    rl: readline.Interface;
    user: string;
    store: any;
    userCore: any;
    registry: any;
    profile: any;
    swarm: any;
    follows: any[];
    constructor({ profile, swarm, store, userCore, registry, user }: {
        profile: any;
        swarm: any;
        store: any;
        userCore: any;
        registry: any;
        user: string;
    });
    ready(): Promise<void>;
    cmdPrompt(): Promise<void>;
    messagesCoreFromName(name: string): Promise<any>;
    tweet(core: any): Promise<void>;
    printCore(core: any): Promise<void>;
}
