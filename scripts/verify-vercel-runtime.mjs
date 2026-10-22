import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { isPatchedRuntime } from '../src/server/runtime-policy.mjs';

const target = new URL(process.argv[2]);
assert.ok(target.protocol === 'https:' && !target.username && !target.password);
const { projectId, orgId } = JSON.parse(
  readFileSync('.vercel/project.json', 'utf8')
);
assert.ok(
  process.env.VERCEL_TOKEN,
  'Inject the project Vercel credential first.'
);
const query = `?teamId=${encodeURIComponent(orgId)}`;
async function api(path) {
  const response = await fetch(`https://api.vercel.com${path}${query}`, {
    headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
  });
  assert.ok(response.ok, `Vercel API returned ${response.status}`);
  return response.json();
}
// Resolve ownership before sending a production application credential.
const deployment = await api(
  `/v13/deployments/${encodeURIComponent(target.hostname)}`
);
assert.equal(
  deployment.projectId,
  projectId,
  'Target is not this Vercel project.'
);
assert.equal(deployment.readyState, 'READY');
const envs = await api(`/v10/projects/${projectId}/env`);
const entry = envs.envs.find(
  (env) =>
    env.key === 'CRON_SECRET' &&
    env.target?.includes('production') &&
    !env.gitBranch
);
assert.ok(entry, 'Missing production runtime diagnostic credential.');
const secret = await api(`/v1/projects/${projectId}/env/${entry.id}`);
assert.ok(
  secret.decrypted && secret.value,
  'Cannot resolve the runtime diagnostic credential.'
);
const result = spawnSync(
  'vercel',
  [
    'curl',
    '/api/internal/runtime',
    '--deployment',
    target.origin,
    '--scope',
    orgId,
    '--token',
    process.env.VERCEL_TOKEN,
    '--',
    '--silent',
    '--show-error',
    '--max-time',
    '30',
    '--config',
    '-',
    '--write-out',
    '\n%{http_code}',
  ],
  {
    input: `header = ${JSON.stringify(`Authorization: Bearer ${secret.value}`)}\n`,
    encoding: 'utf8',
    timeout: 45000,
  }
);
assert.equal(result.status, 0, 'Vercel runtime request failed.');
const split = result.stdout.lastIndexOf('\n');
const status = Number(result.stdout.slice(split + 1).trim());
const runtime = JSON.parse(result.stdout.slice(0, split));
console.log(
  JSON.stringify(
    { deploymentId: deployment.id, target: target.origin, status, ...runtime },
    null,
    2
  )
);
assert.equal(
  status,
  200,
  'The deployed runtime did not meet the security baseline.'
);
assert.equal(runtime.patched, true);
assert.ok(isPatchedRuntime(runtime.node), 'Unexpected runtime version.');
