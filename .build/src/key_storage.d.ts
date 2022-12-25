/// <reference types="node" />
export declare function userConfigKey(user: string): Buffer | undefined;
export declare function updateUserConfigKey(user: string, key: Buffer): void;
export declare function getKey(fileName: string): Buffer | undefined;
export declare function updateKey(dirName: string, fileName: string, key: Buffer): void;
