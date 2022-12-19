import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

export function userConfigKey(user: string) {
  const fileName = `./.users/${user}/configKey`;
  return getKey(fileName)
}

export function updateUserConfigKey(user: string, key: Buffer) {
  const dirName = `./.users/${user}`;
  return updateKey(dirName, 'configKey', key)
}

export function getKey(fileName: string) {
  if (existsSync(fileName)) {
    return readFileSync(fileName);
  }
}

export function updateKey(dirName: string, fileName: string, key: Buffer) {
  if (!existsSync(dirName)) {
    mkdirSync(dirName, { recursive: true });
  }
  const fullPath = `${dirName}/${fileName}`;
  writeFileSync(fullPath, key);
}