import assert from 'node:assert/strict';

export const PUBLIC_BUILD_KEYS = new Set([
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_NAME',
  'NEXT_PUBLIC_GA_ID',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_CLOUDINARY_API_KEY',
  'NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDERS',
  'NEXT_PUBLIC_OAUTH',
]);

export function validatePublicBuildConfig(config) {
  for (const [key, value] of Object.entries(config)) {
    assert.ok(
      PUBLIC_BUILD_KEYS.has(key) && typeof value === 'string',
      'Invalid public build configuration.'
    );
  }
  assert.ok(config.NEXT_PUBLIC_OAUTH, 'Missing OAuth browser configuration.');
  assert.ok(
    config.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    'Missing Cloudinary browser configuration.'
  );
  return config;
}
