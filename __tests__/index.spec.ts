import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach, mock } from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';

// 用于捕获 console.log 输出
const originalLog = console.log;
let logs: string[] = [];

// 用于捕获 execSync 调用
let execCalls: Array<{ cmd: string; opts: { cwd: string } }> = [];

// mock child_process.execSync，避免测试真正执行安装
mock.module('child_process', () => {
  return {
    execSync: (cmd: string, opts: { cwd: string }) => {
      execCalls.push({ cmd, opts });
    },
  };
});

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
  execCalls = [];
});

const tempDirs: string[] = [];

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

describe('detectPmInstallLog - with lock file (executes install)', () => {
  test('should exec pnpm add when pnpm-lock.yaml exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(execCalls).toHaveLength(1);
    expect(execCalls[0].cmd).toBe('pnpm add lodash');
    expect(execCalls[0].opts.cwd).toBe(dir);
    expect(logs).toHaveLength(0);
  });

  test('should exec yarn add when yarn.lock exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(execCalls).toHaveLength(1);
    expect(execCalls[0].cmd).toBe('yarn add lodash');
    expect(execCalls[0].opts.cwd).toBe(dir);
    expect(logs).toHaveLength(0);
  });

  test('should exec npm install when package-lock.json exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'package-lock.json'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(execCalls).toHaveLength(1);
    expect(execCalls[0].cmd).toBe('npm install lodash');
    expect(execCalls[0].opts.cwd).toBe(dir);
    expect(logs).toHaveLength(0);
  });

  test('should prefer pnpm over yarn when both lock files exist', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(execCalls).toHaveLength(1);
    expect(execCalls[0].cmd).toBe('pnpm add lodash');
  });

  test('should exec with multiple packages joined by space', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['react', 'vue', 'lodash'], cwd: dir });

    expect(execCalls).toHaveLength(1);
    expect(execCalls[0].cmd).toBe('pnpm add react vue lodash');
  });

  test('should use process.cwd() when cwd is not provided', async () => {
    const detectPmInstallLog = (await import('../src')).default;

    detectPmInstallLog({ packages: ['lodash'] });

    // 项目根目录存在 pnpm-lock.yaml，应执行 pnpm add
    expect(execCalls).toHaveLength(1);
    expect(execCalls[0].cmd).toBe('pnpm add lodash');
    expect(execCalls[0].opts.cwd).toBe(process.cwd());
  });
});

describe('detectPmInstallLog - no lock file (only logs)', () => {
  test('should only log when no lock file exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(execCalls).toHaveLength(0);
    expect(logs[0]).toContain('npm');
    expect(logs[0]).toContain('lodash');
  });

  test('should log for each package when no lock file', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: ['react', 'vue', 'lodash'], cwd: dir });

    expect(execCalls).toHaveLength(0);
    expect(logs).toHaveLength(3);
    expect(logs[0]).toContain('react');
    expect(logs[1]).toContain('vue');
    expect(logs[2]).toContain('lodash');
  });

  test('should handle empty packages array', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: [], cwd: dir });

    expect(execCalls).toHaveLength(0);
    expect(logs).toHaveLength(0);
  });
});