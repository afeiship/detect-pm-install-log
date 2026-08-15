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