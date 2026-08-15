import fs from 'fs';
import path from 'path';

export interface Options {
  packages: string[];
  cwd?: string;
}

type PM = 'pnpm' | 'yarn' | 'npm';

const LOCK_FILE_MAP: Array<{ lockFile: string; pm: PM }> = [
  { lockFile: 'pnpm-lock.yaml', pm: 'pnpm' },
  { lockFile: 'yarn.lock', pm: 'yarn' },
];

function detectPm(cwd: string): PM {
  for (const { lockFile, pm } of LOCK_FILE_MAP) {
    if (fs.existsSync(path.join(cwd, lockFile))) {
      return pm;
    }
  }
  return 'npm';
}

function detectPmInstallLog(options: Options): void {
  const { packages, cwd = process.cwd() } = options;
  const pm = detectPm(cwd);
  packages.forEach((pkg) => {
    console.log(`📦 installing ${pkg} dependencies via "${pm}"...`);
  });
}

export default detectPmInstallLog;