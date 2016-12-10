const install = require('npm-install-package')
const getPkgJson = require('package-json')
const eslintFailingRulesOffConfig = require('eslint-failing-rules-off-config')
const pify = require('pify')
const findRoot = require('find-root')
const { resolve } = require('path')
const writeJsonFile = require('write-json-file')
const addNpmScript = require('add-npm-script')
const prependToNpmScript = require('prepend-to-npm-script')

const getPkgRoot = () => findRoot(process.cwd())

const getPeerDeps = (pkg) => {
  if (!pkg.peerDependencies) {
    return []
  }
  return Object.keys(pkg.peerDependencies)
}

const getPkgsToInstall = ([shareableConfigPkgName, peerDeps]) => {
  const pkgsToInstall = ['eslint', shareableConfigPkgName]
  peerDeps.forEach((peerDep) => {
    if (!pkgsToInstall.includes(peerDep)) {
      pkgsToInstall.push(peerDep)
    }
  })
  return pkgsToInstall
}

const installPkgs = (pkgs) => {
  return pify(install)(pkgs, { saveDev: true })
}

const addLintScript = (files) => {
  return addNpmScript('lint', `eslint --config .eslintrc.json "${files.join(' ')}"`)
}

const prependLintToTestScript = () => {
  return prependToNpmScript('test', 'npm run lint')
}

const writeEslintRc = (config) => {
  return writeJsonFile(
    resolve(getPkgRoot(), '.eslintrc.json'),
    config,
    { indent: 2 }
  )
}

const getFailingRulesOffConfig = ([files]) => {
  const localEslint = require(resolve(getPkgRoot(), 'node_modules', 'eslint'))
  return eslintFailingRulesOffConfig(localEslint, files)
}

const setupEslint = (files, shareableConfig) => {
  const shareableConfigPkgName = 'eslint-config-' + shareableConfig
  const shareableConfigPkgJson = getPkgJson(shareableConfigPkgName, 'latest')
  const peerDeps = shareableConfigPkgJson.then(getPeerDeps)
  const pkgsToInstall = Promise.all([shareableConfigPkgName, peerDeps])
    .then(getPkgsToInstall)
  const pkgsWereInstalled = pkgsToInstall.then(installPkgs)
  const lintScriptWasAdded = addLintScript(files)
  const lintWasPrependedToTestScript = lintScriptWasAdded.then(prependLintToTestScript)
  const initialEslintRcWasWritten = writeEslintRc({ extends: shareableConfig })
  const failingRulesOffConfig = Promise.all([
    files,
    pkgsWereInstalled,
    initialEslintRcWasWritten
  ]).then(getFailingRulesOffConfig)
  const finalEslintRcWasWritten = failingRulesOffConfig.then(rules => writeEslintRc({ extends: shareableConfig, rules }))
  const done = Promise.all([
    finalEslintRcWasWritten,
    lintScriptWasAdded,
    lintWasPrependedToTestScript
  ])
  return done
}

module.exports = setupEslint
