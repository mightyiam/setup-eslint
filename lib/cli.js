#!/usr/bin/env node

const setupEslint = require('.')
const yargs = require('yargs')

const { argv } = yargs
  .usage('Usage: $0 <shareable config> --files <glob [glob [...]]>')
  .array('files')
  .describe('files', 'file glob patterns')
  .demand('files', true)
  .demand(1, 1)

setupEslint(argv.files, argv._[0])
