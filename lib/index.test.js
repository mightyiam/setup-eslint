const test = require('ava')

const subject = require('.')

test('exports a function of arity 2', t => {
  t.is(typeof subject, 'function')
  t.is(subject.length, 2)
})
