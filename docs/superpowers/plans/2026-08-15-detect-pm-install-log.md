# detect-pm-install-log 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `src/index.ts` 从数字拆位函数重写为包管理器检测 + 安装提示日志打印工具。

**Architecture:** 单文件核心实现，使用 Node.js 内置 `fs`/`path` 模块同步检测锁文件，通过 `console.log` 输出提示。测试使用 Bun test，通过临时目录模拟锁文件场景。

**Tech Stack:** TypeScript, Node.js 内置模块, Bun test

---

### Task 1: 重写 `src/index.ts` — 核心实现

**Files:**
- Create: `src/index.ts` (覆盖重写)

- [ ] **Step 1: 编写核心源码**

```ts
// src/index.ts
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
```

- [ ] **Step 2: 验证构建通过**

```bash
bun run build
```

Expected: tsup 正常输出，生成 `dist/index.cjs.js`、`dist/index.esm.js`、`dist/index.d.ts`

---

### Task 2: 重写测试 — 覆盖所有场景

**Files:**
- Create: `__tests__/index.spec.ts` (覆盖重写)

- [ ] **Step 1: 编写测试用例**

```ts
// __tests__/index.spec.ts
import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';

// 用于捕获 console.log 输出
const originalLog = console.log;
let logs: string[] = [];

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

function createTempDir(): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dpm-test-'));
  return tmpDir;
}

describe('detectPmInstallLog', () => {
  test('should detect pnpm when pnpm-lock.yaml exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('pnpm');
    // cleanup
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('should detect yarn when yarn.lock exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('yarn');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('should default to npm when no lock file exists', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('npm');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('should prefer pnpm over yarn when both lock files exist', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();
    fs.writeFileSync(path.join(dir, 'yarn.lock'), '');
    fs.writeFileSync(path.join(dir, 'pnpm-lock.yaml'), '');

    detectPmInstallLog({ packages: ['lodash'], cwd: dir });

    expect(logs[0]).toContain('pnpm');
    fs.rmSync(dir, { recursive: true, force: true });
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
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('should handle empty packages array', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    const dir = createTempDir();

    detectPmInstallLog({ packages: [], cwd: dir });

    expect(logs).toHaveLength(0);
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('should use process.cwd() when cwd is not provided', async () => {
    const detectPmInstallLog = (await import('../src')).default;
    // 在项目根目录没有锁文件，应检测为 npm
    detectPmInstallLog({ packages: ['lodash'] });

    expect(logs[0]).toContain('npm');
  });
});
```

- [ ] **Step 2: 运行测试验证通过**

```bash
bun test
```

Expected: 6 个测试全部 PASS

---

### Task 3: 更新 README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 更新 README 内容**

```markdown
# detect-pm-install-log
> Detect project package manager and print install hint log for given packages.

[![version][version-image]][version-url]
[![license][license-image]][license-url]
[![download][download-image]][download-url]

## installation
```shell
yarn add @jswork/detect-pm-install-log
```

## usage
```ts
import detectPmInstallLog from '@jswork/detect-pm-install-log';

detectPmInstallLog({
  packages: [
    '@jswork/http-schema',
    '@jswork/universal-request-adapter-fetch',
    '@jswork/universal-request-core',
  ]
});

// 📦 installing @jswork/http-schema dependencies via "pnpm"...
// 📦 installing @jswork/universal-request-adapter-fetch dependencies via "pnpm"...
// 📦 installing @jswork/universal-request-core dependencies via "pnpm"...
```

## API

### detectPmInstallLog(options)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| options.packages | `string[]` | — | Packages to install |
| options.cwd | `string` | `process.cwd()` | Project root directory |

### Detection Rules

| Lock file | Detected PM |
|-----------|-------------|
| `pnpm-lock.yaml` | pnpm |
| `yarn.lock` | yarn |
| none / other | npm |

## license
Code released under [the MIT license](https://github.com/afeiship/detect-pm-install-log/blob/main/LICENSE.txt).

[version-image]: https://img.shields.io/npm/v/@jswork/detect-pm-install-log
[version-url]: https://npmjs.org/package/@jswork/detect-pm-install-log

[license-image]: https://img.shields.io/npm/l/@jswork/detect-pm-install-log
[license-url]: https://github.com/afeiship/detect-pm-install-log/blob/main/LICENSE.txt

[download-image]: https://img.shields.io/npm/dm/@jswork/detect-pm-install-log
[download-url]: https://www.npmjs.com/package/@jswork/detect-pm-install-log
```

---

### Task 4: 提交代码

- [ ] **Step 1: 提交所有改动**

```bash
git add src/index.ts __tests__/index.spec.ts README.md
git commit -m "feat: rewrite detect-pm-install-log with package manager detection

- Detect pm from lock files (pnpm-lock.yaml / yarn.lock)
- Print install hint log for given packages
- Support custom cwd option, default to process.cwd()
- No external dependencies, only built-in fs/path modules"
```