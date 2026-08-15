import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';

// 用于捕获 console.log 输出
const originalLog = console.log;
let logs: string[] = [];
const tempDirs: string[] = [];

beforeAll(() => {
  console.log = (...args: string[]) => {
    logs.push(args.join(' '));
  };
});

afterAll(() => {
  console.log = originalLog;
});

beforeEach(() => {
  logs = [];
});

afterEach(() => {
  for (const dir of tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

function createTempDir(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dpm-test-'));
  tempDirs.push(tmpDir);
  return tmpDir;
}

describe('detectPmInstallLog', () => {
  test('should detect pnpm when pnpm-lock.yaml exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('pnpm');
  });

  test('should detect yarn when yarn.lock exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('yarn');
  });

  test('should default to npm when no lock file exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('npm');
  });

  test('should prefer pnpm over yarn when both lock files exist', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('pnpm');
  });

  test('should print for each package in array', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({
      packages: ['react', 'vue', 'lodash'],
      cwd: dir,
    });

    expect(logs).toHaveLength(3);
    expect(logs[0]).toContain('react');
    expect(logs[1]).toContain('vue');
    expect(logs[2]).toContain('lodash');
  });

  test('should handle empty packages array', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: [], cwd: dir });

    expect(logs).toHaveLength(0);
  });

  test('should use process.cwd() when cwd is not provided', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    // 在项目根目录没有锁文件，应检测为 npm
    detectPmInstallLog({ packages: ['lodash'] });

    expect(logs[0]).toContain('npm');
  });
});