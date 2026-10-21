import { getRuntimeStatus } from '../src/server/runtime-policy.mjs';

const status = getRuntimeStatus();
if (!status.patched) {
  console.error(
    `Unsupported Node.js ${status.node}. Use Node.js >=${status.minimumNode} <25 (nvm use).`
  );
  process.exit(1);
}

console.log(`Node.js ${status.node} meets the security baseline.`);
