import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validatePublicBuildConfig } from '../scripts/public-build-config.mjs';

const valid = {
  NEXT_PUBLIC_OAUTH: 'https://example.com/oauth',
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'example',
};
test('accepts the required public browser settings', () => {
  assert.deepEqual(validatePublicBuildConfig(valid), valid);
});
test('rejects private or unrecognized settings in container build data', () => {
  for (const key of ['DATABASE_URL', 'CRON_SECRET', 'NEXT_PUBLIC_UNKNOWN']) {
    assert.throws(() =>
      validatePublicBuildConfig({ ...valid, [key]: 'do-not-package' })
    );
  }
});
test('rejects missing browser settings and non-string values', () => {
  assert.throws(() => validatePublicBuildConfig({}));
  assert.throws(() =>
    validatePublicBuildConfig({ ...valid, NEXT_PUBLIC_GA_ID: 123 })
  );
});
