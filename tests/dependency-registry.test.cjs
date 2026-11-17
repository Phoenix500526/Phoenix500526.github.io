const { test } = require('node:test');
const assert = require('node:assert/strict');
const lock = require('../package-lock.json');

test('locked tarballs use the official HTTPS registry and retain integrity checks', () => {
  for (const [name, entry] of Object.entries(lock.packages)) {
    if (!entry.resolved) continue;
    assert.equal(new URL(entry.resolved).origin, 'https://registry.npmjs.org', name);
    assert.match(entry.integrity || '', /^sha(?:1|256|384|512)-/, name);
  }
});
