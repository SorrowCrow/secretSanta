/**
 * Helper to construct API routes with basePath awareness for client-side fetches.
 * Ensures API requests respect NEXT_PUBLIC_BASE_PATH (defaults to /secretSanta).
 */

export function getBasePath(): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/secretSanta';
  return basePath === '/' ? '' : basePath.replace(/\/+$/, '');
}

export function getApiPath(path: string): string {
  const base = getBasePath();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
