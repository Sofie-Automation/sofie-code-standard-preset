# Changelog

All notable changes to this project will be documented in this file. See [Convential Commits](https://www.conventionalcommits.org/en/v1.0.0/#specification) for commit guidelines.

## [3.1.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v3.1.0...v3.1.1) (Tue Jul 29 2025)


### Fixes

* typo in eslint config [a54e9a2](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/a54e9a25d499b688093b567f6015c160b07b094d)

## [3.1.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v3.0.0...v3.1.0) (Tue Jun 17 2025)


### Features

* add support for using vitest (#29) [07c9d20](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/07c9d2082abc6e5518bac86e997049f25db98b5e)
* initial support for monorepo with single changelog (#30) [87dc3d5](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/87dc3d5dff42de5c8dc9369f001cca6787c7df4d)
* initial support for monorepo with single changelog [3a20974](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/3a20974c50b3409485755b06f4b8c45e62c82452)

### Fixes

* generate correct compare url for initial tag [444f86a](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/444f86ab6278ae65346a9fbb72b2110a435795cd)

## [3.0.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.5.2...v3.0.0) (Tue Feb 04 2025)


### Features

* update to eslint 9 and node 20 [7961b73](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/7961b735a9c8cd44c411fff90c4c17bd26106db8)

### ⚠ BREAKING CHANGES

- Node 20 is now the minimum supported version
- Is now using eslint 9, configuration files will have to be updated

## [2.5.2](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.5.1...v2.5.2) (Thu Sep 28 2023)


### Fixes

* pin `lint-staged` to node14 compatible version [31d2ee6](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/31d2ee6ff50b6241f48e65aadf1d69f1f8d01bd6)
* add --allowList and --allowLicenses to license-validate script (#21) [a9529ef](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/a9529ef8344b882f24e8615858cb1024f5e3d0d0)

## [2.5.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.5.0...v2.5.1) (Wed Aug 09 2023)


### Fixes

* revert feat: switch from eslint-plugin-node to eslint-plugin-n [722cad9] [617f100](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/617f100f74c818a067455a881072dc9902c47711)

## [2.5.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.7...v2.5.0) (Wed Aug 09 2023)


### Fixes

* add BlueOak-1.0.0 to allowed licenses (#20) [f22f78f](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/f22f78fb20b9628955875817fc5cf313871056d8)
* use license-checker directly instead of CLI [a685321](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/a6853219deb48dbb5830834f283dee7a8aaf3138)

### Features

* switch from eslint-plugin-node to eslint-plugin-n [722cad9](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/722cad945fed86c7c1c6c021d53f6fe0e7fdda09)

## [2.4.7](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.6...v2.4.7) (Wed May 10 2023)


## [2.4.6](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.5...v2.4.6) (Fri Apr 28 2023)


## [2.4.5](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.4...v2.4.5) (Fri Apr 28 2023)


## [2.4.4](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.3...v2.4.4) (Fri Apr 28 2023)


## [2.4.3](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.2...v2.4.3) (Fri Apr 28 2023)


## [2.4.2](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.1...v2.4.2) (Fri Apr 28 2023)


### Fixes

* `sofie-licensecheck` unable to find `license-checker` with yarn3 (#16) [abd0fa6](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/abd0fa68559aebec2b6670ccbd436f487356b819)
* remove stray console.log [2480da3](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/2480da3b2108fe9861312fc21c3f9361eba98153)

## [2.4.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.4.0...v2.4.1) (Sun Mar 26 2023)


### Fixes

* `sofie-version` support for yarn3 [a5d81a8](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/a5d81a8d55814fe6143c191b55c2aec5a7503f92)

## [2.4.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.3.1...v2.4.0) (Tue Mar 14 2023)


### Features

* add `@sofie-automation/eslint-plugin` eslint rules [5dc8199](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/5dc8199e632cc0fbdd59ca552405f49e6c3e97d8)

### Fixes

* sofie-version script failing in fresh repository [6528082](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/65280822d57807d9ac67fa3cc8df4e6ed99b51ea)

## [2.3.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.3.0...v2.3.1) (Fri Feb 10 2023)


## [2.3.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.2.0...v2.3.0) (Tue Jan 10 2023)


### Features

* require typescript 4.9 [33790cb](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/33790cbde128b8f5458af08a28576c6e73172eb7)

## [2.2.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.1.0...v2.2.0) (Fri Nov 11 2022)


### Features

* **(updateVersion)** override for lastTag [9ae1576](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/9ae1576a2c8d7e87249710fabdc73805c8f32f60)

## [2.1.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.0.2...v2.1.0) (Tue Oct 25 2022)


### Fixes

* use prerelease identifier (#11) [1f381e8](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/1f381e800f9cbb03910ba2705ecc924b075ea92c)
* do not generate changelog without repo url [a944749](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/a94474987ddc441b1345c3edd1ff3e938efaf1e4)

### Features

* update dependencies [3c2dc09](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/3c2dc09d1b995f39fdcacd112f08eea3fd47d5e3)

### [2.0.2](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.0.1...v2.0.2) (2022-05-19)


### Bug Fixes

* add no-duplicate-enum-values ([#9](https://github.com/Sofie-Automation/sofie-code-standard-preset/issues/9)) ([898cb9d](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/898cb9df24bba9763cccff631f9e94c4c086376b))

### [2.0.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v2.0.0...v2.0.1) (2022-04-20)


### Bug Fixes

* allow node 18 ([74f8aeb](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/74f8aeb03bc90c4a7af4201b356d3bfbe361e06b))

## [2.0.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v1.1.0...v2.0.0) (2022-02-18)


### ⚠ BREAKING CHANGES

* update minimum node version to "^14.18 || ^16.14"

### Features

* update minimum node version to "^14.18 || ^16.14" ([5ae7495](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/5ae74952cadcf6124402029bce31ca009cf6602e))

## [1.1.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v1.0.0...v1.1.0) (2022-01-25)


### Features

* enable strict type checking. enable some more rules ([#8](https://github.com/Sofie-Automation/sofie-code-standard-preset/issues/8)) ([fc97657](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/fc97657b39ee1a34323ad62ccca3c33fc9d38cf0))

## [1.0.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.5.1...v1.0.0) (2022-01-18)


### ⚠ BREAKING CHANGES

* update dependencies. expects typescript 4.5

### Features

* update dependencies. expects typescript 4.5 ([5603563](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/5603563f2cb9e20b4679d7c2b7d089704ec17a2a))


### Bug Fixes

* Updated URLs to match the renamed repo ([5f9abee](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/5f9abee27c09e6b87cce2f48d34586fa7f42dd06))

### [0.5.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.5.0...v0.5.1) (2021-12-17)


### Bug Fixes

* allow 'Python-2.0' license ([7b6f674](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/7b6f6741228e9c71a289c57d815d69b528fd8367))

## [0.5.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.4.2...v0.5.0) (2021-11-01)


### ⚠ BREAKING CHANGES

* re-add a newer version of husky as it doesn't autoinstall now
* remove husky as a dependency, as if installed it cannot be disabled which can cause problems

### Features

* re-add a newer version of husky as it doesn't autoinstall now ([e3699b5](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/e3699b52cda512cfc115a13ab0cd00d46fcec0af))
* remove husky as a dependency, as if installed it cannot be disabled which can cause problems ([44138b2](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/44138b2c9fad4f3e330173f606fad20ab4f0c304))
* update eslint to v8 ([dc4a44a](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/dc4a44adb7800b4a885a7d4bfc4034b387aa576a))

### [0.4.2](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.4.1...v0.4.2) (2021-06-17)


### Bug Fixes

* allow variables whose name starts with an _ ([561cd20](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/561cd205da88a86255f16ff4853deeba7c85a780))

### [0.4.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.4.0...v0.4.1) (2021-05-28)


### Bug Fixes

* add more keywords to blocked comments ([0f7dabc](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/0f7dabc05e501136dda2c5c55a4a69de2b733b9d))

## [0.4.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.3.0...v0.4.0) (2021-05-28)


### Features

* add jest plugin and nocommit rule ([1d9eee8](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/1d9eee84f7e1d2a5da91758306335cdf9424c19f))
* update typescript dependency ([6e4c5c1](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/6e4c5c1da51ad882908d8a662959ba64ee11604a))

## [0.3.0](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.2.5...v0.3.0) (2021-05-14)


### ⚠ BREAKING CHANGES

* update license checker script to esm

### Features

* github actions ([35a5f4b](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/35a5f4b8929cac12b9fbf34e605690fb3836b229))
* update license checker script to esm ([d07d311](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/d07d311a500fc88064f7c882f3370af58511da41))

### [0.2.5](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.2.4...v0.2.5) (2021-04-28)


### Features

* allow Artistic-2.0 as it is MIT compatible ([b490bd3](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/b490bd3e1d0ca51f20539b32d8d357b756cc0547))

### [0.2.4](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.2.3...v0.2.4) (2021-02-19)


### Features

* add rule @typescript-eslint/no-floating-promises ([#7](https://github.com/Sofie-Automation/sofie-code-standard-preset/issues/7)) ([eec181a](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/eec181a9fed7b5b5c38a4fc22b15ca6ec1c04ad4))

### [0.2.3](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.2.2...v0.2.3) (2021-02-05)

### [0.2.2](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.2.1...v0.2.2) (2021-01-12)


### Bug Fixes

* '.d.ts' is a valid extension to include from ts files ([f88345e](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/f88345efd55e417ab584257f88cef92ff8f86a61))

### [0.2.1](https://github.com/Sofie-Automation/sofie-code-standard-preset/compare/v0.2.0...v0.2.1) (2020-12-14)


### Features

* add option to ignore certain packages which are false positives [publish] ([be171ca](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/be171caeca7bb93213f16ffba05bb4214ebfa741))

## 0.2.0 (2020-11-16)


### Features

* eslint: turn off no-use-before-define ([33888b9](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/33888b9440b7c0d1dfc6c61ca04b1df3f8698bde))
* initial commit ([f9b276a](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/f9b276aca44df4d7681c85f6304db9520f43a567))
* update prettierrc ([5fc0e03](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/5fc0e036e699ea3fcf529aa0f1818ad11d79952b))


### Bug Fixes

* [publish] don't need to re-expose the binaries ([bdea359](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/bdea35987bf700fe78a2627eaec5e75b71d5d021))
* add back a wrapper script to abstract the checker lib from library consumers [publish] ([a6acca8](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/a6acca8c64be8b368e1ec3fdbfd884fdf5d69aeb))
* ignore the package it is being run for, and add command to output a full report [publish] ([e818db8](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/e818db8d32e9ded130715f4bb9862bf8f45aca27))
* node 10 minimum + TS 4.0 + readme ([ae6db75](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/ae6db754fc5d1364f958badc4dfdf32da238e6b8))
* prettier eslint config ([57b2f9f](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/57b2f9fe4f576b1b1095279048d748becef94ba0))
* remove typescript rules for js files ([67becbb](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/67becbb96be13844baa5c5f0bddb6f2987374033))
* some js linting ([301818c](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/301818cac8021dd251ebb6a724d1d3b33cff3051))
* suggested updates to readme based on some experience ([b6a8b7e](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/b6a8b7e2a68ff7937633129392dc6dea3312f668))
* use license-checker instead of legally ([f1a59ac](https://github.com/Sofie-Automation/sofie-code-standard-preset/commit/f1a59acce97dc57b0a419c8153dfc56ab91f3205))
