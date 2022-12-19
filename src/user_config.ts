import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

export function userConfigKey(user: string) {
  const fileName = `./.users/${user}/configKey`;
  if (existsSync(fileName)) {
    return readFileSync(fileName);
  }
}
export function updateUserConfigKey(user: string, configKey: Buffer) {
  const dirName = `./.users/${user}`;
  const fileName = `${dirName}/configKey`;
  if (!existsSync(dirName)) {
    mkdirSync(dirName, { recursive: true });
  }
  writeFileSync(fileName, configKey);
}