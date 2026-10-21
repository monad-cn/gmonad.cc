import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getRuntimeStatus, isPatchedRuntime } from '../src/server/runtime-policy.mjs';

test('rejects EOL, pre-patch and unsupported major versions', () => {
  for (const version of ['20.11.1', '22.23.4', '24.18.0', '24.22.0', '26.12.1']) {
    assert.equal(isPatchedRuntime(version), false, version);
  }
});

test('accepts the fixed Node 24 baseline and later stable patches', () => {
  for (const version of ['24.22.1', 'v24.22.1', '24.22.2', '24.23.0']) {
    assert.equal(isPatchedRuntime(version), true, version);
  }
});

test('fails closed for missing, malformed and prerelease versions', () => {
  for (const version of ['', '24.x', '24.22', '24.22.1-rc.1', '24.22.1junk']) {
    assert.equal(isPatchedRuntime(version), false, version);
  }
});

test('reports only runtime component versions and baseline status', () => {
  assert.deepEqual(
    getRuntimeStatus({ node: '24.22.1', openssl: 'test-openssl', brotli: 'test-brotli' }),
    {
      node: '24.22.1', minimumNode: '24.22.1', patched: true,
      openssl: 'test-openssl', brotli: 'test-brotli',
    }
  );
});
