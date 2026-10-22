import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  PUBLIC_BUILD_KEYS,
  validatePublicBuildConfig,
} from './public-build-config.mjs';

const { projectId, orgId } = JSON.parse(
  readFileSync('.vercel/project.json', 'utf8')
);
assert.ok(
  process.env.VERCEL_TOKEN,
  'Run with the project Vercel credential injected.'
);
const headers = { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` };
async function vercelApi(path) {
  const response = await fetch(`https://api.vercel.com${path}`, { headers });
  assert.ok(response.ok, `Vercel API returned ${response.status}`);
  return response.json();
}

// Only public browser settings may enter the generated build input.
const query = `?teamId=${encodeURIComponent(orgId)}`;
const envs = await vercelApi(`/v10/projects/${projectId}/env${query}`);
const publicEnv = {};
for (const env of envs.envs) {
  if (
    !PUBLIC_BUILD_KEYS.has(env.key) ||
    !env.target?.includes('production') ||
    env.gitBranch
  )
    continue;
  const detail = await vercelApi(
    `/v1/projects/${projectId}/env/${env.id}${query}`
  );
  assert.ok(
    detail.decrypted || detail.type === 'plain',
    `Cannot resolve ${env.key}`
  );
  publicEnv[env.key] = detail.value;
  console.log(`Including public build setting: ${env.key}`);
}
validatePublicBuildConfig(publicEnv);
mkdirSync('.container-build', { recursive: true });
writeFileSync('.container-build/public-env.json', JSON.stringify(publicEnv), {
  mode: 0o600,
});
try {
  const result = spawnSync(
    'npm',
    [
      'exec',
      '--yes',
      '--registry=https://registry.npmjs.org',
      '--package=vercel@64.7.0',
      '--',
      'vercel',
      'deploy',
      '--prod',
      '--skip-domain',
      '--yes',
      '--scope',
      orgId,
      '--token',
      process.env.VERCEL_TOKEN,
    ],
    { stdio: 'inherit', env: process.env }
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  rmSync('.container-build/public-env.json', { force: true });
}
