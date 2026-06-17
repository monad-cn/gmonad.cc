export const API_BASE_PATH = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    return API_BASE_PATH;
  }

  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  const appUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';

  if (appUrl && API_BASE_PATH.startsWith('/')) {
    return `${appUrl}${API_BASE_PATH}`;
  }

  return API_BASE_PATH;
}
