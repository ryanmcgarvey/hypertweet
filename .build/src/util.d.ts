/// <reference types="node" />
export declare function upsert(prev: any, next: any): boolean;
export declare function buildCore({ store, opts, keyPair }: {
    store: any;
    opts?: any;
    keyPair?: any;
}): Promise<{
    core: any;
    keyPair: any;
}>;
export declare function buildDb({ store, keyPair }: {
    store: any;
    keyPair?: any;
}): Promise<{
    core: any;
    keyPair: any;
    db: any;
}>;
export declare function getKeyFromDb(db: any, key: string): Promise<{
    publicKey: Buffer;
    secretKey: Buffer;
} | undefined>;
