# requiremnts

# 1. AI生成npm包提示词
```
请基于下面的js代码，开发一个可发布到npm的通用工具包。
功能：自动检测当前项目包管理器(npm/yarn/pnpm)，返回对应的安装命令前缀，支持外部传入packages依赖数组，输出控制台安装提示日志。

核心逻辑：
1. 通过识别项目根目录锁文件判断包管理器：
- 存在pnpm‑lock.yaml → pnpm add
- 存在yarn.lock → yarn add
- 其他情况 → npm install
2. packages由调用方传入，不是内置固定数组
3. 使用fs、path内置node模块，不需要额外第三方依赖
4. 输出控制台日志：打印📦开头提示，显示当前识别到的包管理器名称

输出完整npm包项目结构：
- package.json（type:commonjs + esm双支持，main、exports，scripts:build、test、prepublishOnly）
- tsconfig.json 使用typescript编写源码
- src/index.ts 主源码，导出核心函数，类型定义，支持入参 { packages: string[] }
- 简单README.md：安装、使用示例、API说明
- .gitignore

要求：
1. 函数设计：导出一个函数 detectPmAndLog(options)，options接收packages:string[]
2. 只做检测+控制台打印日志，不执行真正子进程安装命令
3. 完善ts类型，导出类型定义
4. 代码简洁，注释精简，符合npm开源包规范
5. 不要写执行shell安装的逻辑，仅识别pm + 打印提示文本
```

# 2. 项目名（3个可选，npm可直接发布风格）
> 优先选第一个
1. `detect-pm-install-log`
2. `pm-detector-logger`
3. `pkg-manager-detect`

# 3. description（12词左右英文）
> 严格控制12个单词版本
`Detect package manager and print install hint log for given packages`

单词数核对：1.Detect 2.package 3.manager 4.and 5.print 6.install 7.hint 8.log 9.for 10.given 11.packages → 11词，微调一版刚好12词：
`Detect project package manager and print install hint log for given packages`
（12词 ✅）

## 补充使用示例参考（给你写进readme用）
```ts
import detectPmAndLog from 'detect-pm-install-log';

detectPmAndLog({
  packages: [
    '@jswork/http-schema',
    '@jswork/universal-request-adapter-fetch',
    '@jswork/universal-request-core',
  ]
});
```

输出效果和你原代码完全一致：
```
📦 installing http-schema dependencies via "pnpm"...
```

如果你需要，我可以直接把完整ts源码+package.json+readme全套一次性生成出来。
