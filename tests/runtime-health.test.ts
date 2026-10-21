import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../src/pages/api/internal/runtime';

test('runtime health remains authenticated and uncached', async (t) => {
  const originalSecret = process.env.CRON_SECRET;
  process.env.CRON_SECRET = 'runtime-test-secret';
  t.after(() => {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  });

  function request(authorization?: string, method = 'GET') {
    const headers: Record<string, string> = {};
    let code = 0;
    let body: Record<string, unknown> = {};
    const res = {
      setHeader(key: string, value: string) { headers[key] = value; },
      status(value: number) { code = value; return this; },
      json(value: Record<string, unknown>) { body = value; return this; },
    };
    handler(
      { method, headers: { authorization } } as NextApiRequest,
      res as unknown as NextApiResponse
    );
    assert.match(headers['Cache-Control'], /no-store/);
    assert.equal(headers['Vercel-CDN-Cache-Control'], 'no-store');
    return { code, body, headers };
  }

  await t.test('missing, wrong and malformed credentials disclose no versions', () => {
    for (const header of [undefined, 'Bearer wrong', 'runtime-test-secret', 'Bearer ']) {
      const result = request(header);
      assert.equal(result.code, 401);
      assert.deepEqual(result.body, { error: 'Unauthorized' });
    }
  });

  await t.test('authorized GET reports the actual process version', () => {
    const result = request('Bearer runtime-test-secret');
    assert.equal(result.code, 200);
    assert.equal(result.body.node, process.versions.node);
    assert.equal(result.body.patched, true);
    assert.equal(result.body.minimumNode, '24.22.1');
  });

  await t.test('authorized mutation methods are rejected', () => {
    const result = request('Bearer runtime-test-secret', 'POST');
    assert.equal(result.code, 405);
    assert.equal(result.headers.Allow, 'GET');
  });

  await t.test('an unpatched process returns service unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(process.versions, 'node')!;
    Object.defineProperty(process.versions, 'node', { ...descriptor, value: '24.22.0' });
    try {
      const result = request('Bearer runtime-test-secret');
      assert.equal(result.code, 503);
      assert.equal(result.body.patched, false);
    } finally {
      Object.defineProperty(process.versions, 'node', descriptor);
    }
  });

  await t.test('no development bypass exists when the secret is missing', () => {
    delete process.env.CRON_SECRET;
    assert.equal(request('Bearer runtime-test-secret').code, 401);
  });
});
