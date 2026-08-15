---
name: detect-pm-install-log-design
description: "Design spec for detect-pm-install-log npm package rewrite"
metadata:
  type: reference
---

# detect-pm-install-log 设计文档

> 日期：2026-08-15
> 状态：已批准

## 1. 概述

将 `@jswork/detect-pm-install-log` 从当前的数字拆位函数重写为真正的包管理器检测工具。功能：自动检测当前项目使用的包管理器（npm/yarn/pnpm），返回对应安装命令前缀，并在控制台输出安装提示日志。

## 2. 接口设计

### 函数签名

```ts
interface Options {
  packages: string[];  // 必填，要安装的包名列表
  cwd?: string;        // 可选，检测目录，默认 process.cwd()
}

function detectPmInstallLog(options: Options): void;
```

### 导出

- 默认导出：`detectPmInstallLog` 函数
- 命名导出：`Options` 类型定义

### 返回值

- `void` — 纯副作用函数，只打印日志，不返回任何值

## 3. 包管理器检测逻辑

### 检测规则

| 优先级 | 锁文件 | 识别为 | 安装前缀 |
|--------|--------|--------|----------|
| 1 | `pnpm-lock.yaml` | pnpm | `pnpm add` |
| 2 | `yarn.lock` | yarn | `yarn add` |
| 3 | 无/其他 | npm | `npm install` |

- 使用 `fs.existsSync` 同步检查，顺序固定
- 依赖只有 Node.js 内置模块 `fs`、`path`，无第三方依赖

## 4. 输出格式

每个包独立打印一行：

```
📦 installing <包名> dependencies via "<pnpm|yarn|npm>"...
```

- 不对 packages 去重，调用方负责
- 不执行任何子进程安装命令

## 5. 需要修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/index.ts` | 重写 | 替换为检测+打印逻辑 |
| `__tests__/index.spec.ts` | 重写 | 匹配新功能，mock fs 做单元测试 |
| `README.md` | 更新 | 使用示例、API 说明 |

无需修改的文件：`package.json`、`tsconfig.json`、`tsup.config.ts`、`.gitignore`、`LICENSE.txt`

## 6. 测试策略

- 使用 `vi.mock('fs', ...)` (vitest/bun test) 模拟锁文件存在与否
- 测试覆盖：
  - pnpm 场景（`pnpm-lock.yaml` 存在）
  - yarn 场景（`yarn.lock` 存在）
  - npm 默认场景（无锁文件）
  - 自定义 `cwd` 路径
  - 空数组 `packages: []` 边界情况
  - 多个包名打印

## 7. 不做的事情

- ❌ 不执行任何 shell 安装命令
- ❌ 不引入第三方依赖
- ❌ 不对 packages 去重
- ❌ 不添加与当前功能无关的抽象层