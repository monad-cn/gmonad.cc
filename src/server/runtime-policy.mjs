export const MIN_NODE_VERSION = '24.22.1';

export function isPatchedRuntime(version = process.versions.node) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version || '');
  if (!match) return false;

  const [, major, minor, patch] = match.map(Number);
  return major === 24 && (minor > 22 || (minor === 22 && patch >= 1));
}

export function getRuntimeStatus(versions = process.versions) {
  return {
    node: versions.node,
    minimumNode: MIN_NODE_VERSION,
    patched: isPatchedRuntime(versions.node),
    openssl: versions.openssl,
    brotli: versions.brotli,
  };
}
