/**
 * The path the app is served from. Empty locally, "/scoutiq" on GitHub Pages.
 * Next adds `basePath` to routes and assets on its own, but not to the manifest
 * link, the icon links or the service-worker registration — those need it here.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(path: string) {
  return `${BASE_PATH}${path}`;
}
