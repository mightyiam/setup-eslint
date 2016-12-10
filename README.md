[![Build Status](https://travis-ci.org/mightyiam/setup-eslint.svg?branch=master)](https://travis-ci.org/mightyiam/setup-eslint) [![JavaScript Style Guide](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# setup-eslint

Sets up [ESLint](http://eslint.org/).

## API

### `setupEslint(files, shareableConfig)`

- `files`:
  files patterns, as provided to [`executeOnFiles`](http://eslint.org/docs/developer-guide/nodejs-api#executeonfiles).
  For example, `['**/*.js', '**/*.jsx']`.
- `shareableConfig`:
  The name of an [ESLint shareable configuration](http://eslint.org/docs/developer-guide/shareable-configs).
  For example, [`'standard'`](https://www.npmjs.com/package/eslint-config-standard).

Returns empty promise.

## What it does

- installs:
  - `eslint`
  - provided shareable config
  - peer dependencies of shareable config
- adds an ESLint configuration file that:
  - extends from the shareable config
  - has all currently failing rules set to "off" (yes, it runs a check)
- adds a `lint` npm script
- prepends `npm run lint` to npm `test` script

## Example

```js
const setupEslint = require('setup-eslint')
setupEslint(['**/*.js'], 'standard')
  .then(() => console.log('done'))
```
