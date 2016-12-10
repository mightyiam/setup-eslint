const { test } = require('ava')
const readPkgUp = require('read-pkg-up')
const writePkg = require('write-pkg')
const mkdir = require('mkdir-promise')
const del = require('del')
const detectInstalled = require('detect-installed')
const getPkgJson = require('package-json')
const loadJsonFile = require('load-json-file')
const isPlainObject = require('is-plain-object')
const { writeFileSync } = require('fs')

const isInstalled = name => detectInstalled(name, true)
const fixtureDir = 'test/fixture'
const readPkg = async () => (await readPkgUp({ normalize: false })).pkg
let pkg
let eslintConfig
const subject = require('..')
const files = ['**/*.js']
const shareableConfig = 'standard'
const shareableConfigPkgName = 'eslint-config-' + shareableConfig
const npmTestScript = 'echo testing'

test.before(async () => {
  await mkdir(fixtureDir)
  process.chdir(fixtureDir)
  await writePkg({ scripts: { test: npmTestScript } })
  writeFileSync('_foo.js', 'console.log("foo");\n')
  await subject(files, shareableConfig)
  pkg = await readPkg()
  eslintConfig = await loadJsonFile('.eslintrc.json')
})

test.after(async () => {
  process.chdir('../..')
  await del([fixtureDir])
})

test('installs eslint', t => {
  const eslintPkgName = 'eslint'
  t.true(isInstalled(eslintPkgName))
  t.truthy(pkg.devDependencies[eslintPkgName])
})

test('installs provided shareable config', t => {
  t.true(isInstalled(shareableConfigPkgName))
  t.truthy(pkg.devDependencies[shareableConfigPkgName])
})

test('installs peerDeps of provided shareable config', async t => {
  const { peerDependencies: peerDepsObj } = await getPkgJson(shareableConfigPkgName, 'latest')
  t.true(isPlainObject(peerDepsObj))
  const peerDeps = Object.keys(peerDepsObj)
  t.true(peerDeps.length > 0)
  peerDeps.forEach((peerDep) => {
    t.true(isInstalled(peerDep), `${peerDep} is installed`)
  })
})

test('adds an eslint config file', t => {
  t.true(isPlainObject(eslintConfig))
})

test('eslint config file has two properties', t => {
  t.is(Object.keys(eslintConfig).length, 2)
})

test('eslint config file property `extends` is provided shareable config', t => {
  t.is(eslintConfig.extends, shareableConfig)
})

test('eslint config file property `rules` contains failing rules set to "off"', t => {
  t.truthy(eslintConfig.rules)
  t.deepEqual(eslintConfig.rules, { quotes: 'off', semi: 'off' })
})

test('adds npm script `lint` that runs `eslint` with provided file patterns', t => {
  t.truthy(pkg.scripts)
  const expected = `eslint --config .eslintrc.json "${files.join(' ')}"`
  t.is(pkg.scripts.lint, expected)
})

test('prepends `npm run lint && ` to npm `test` script', t => {
  t.truthy(pkg.scripts)
  const expected = 'npm run lint && ' + npmTestScript
  t.is(pkg.scripts.test, expected)
})
