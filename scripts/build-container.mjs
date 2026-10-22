import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { validatePublicBuildConfig } from './public-build-config.mjs';

const publicEnv = JSON.parse(
  readFileSync('.container-build/public-env.json', 'utf8')
);
validatePublicBuildConfig(publicEnv);
for (const task of ['test:runtime', 'typecheck', 'build']) {
  const result = spawnSync('npm', ['run', task], {
    stdio: 'inherit',
    env: { ...process.env, ...publicEnv },
  });
  assert.equal(result.status, 0, `${task} failed`);
}
