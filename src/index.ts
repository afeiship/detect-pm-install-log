import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export interface Options {
  packages: string[];
  cwd?: string;
}

type PM = 'pnpm' | 'yarn' | 'npm';

const LOCK_FILE_MAP: Array<{ lockFile: string; pm: PM }> = [
  { lockFile: 'pnpm-lock.yaml', pm: 'pnpm' },
  { lockFile: 'yarn.lock', pm: 'yarn' },
  { lockFile: 'package-lock.json', pm: 'npm' },
];

const PM_INSTALL_MAP: Record<PM, string> = {
  pnpm: 'pnpm add',
  yarn: 'yarn add',
  npm: 'npm install',
};

function detectPm(cwd: string): { pm: PM; hasLock: boolean } {
  for (const { lockFile, pm } of LOCK_FILE_MAP) {
    if (fs.existsSync(path.join(cwd, lockFile))) {
      return { pm, hasLock: true };
    }
  }
  return { pm: 'npm', hasLock: false };
}

function detectPmInstallLog(options: Options): void {
  const { packages, cwd = process.cwd() } = options;
  const { pm, hasLock } = detectPm(cwd);

  if (hasLock) {
    const cmd = `${PM_INSTALL_MAP[pm]} ${packages.join(' ')}`;
    execSync(cmd, { cwd, stdio: 'inherit' });
  } else {
    packages.forEach((pkg) => {
      console.log(`📦 installing ${pkg} dependencies via "${pm}"...`);
    });
  }
}

export default detectPmInstallLog;