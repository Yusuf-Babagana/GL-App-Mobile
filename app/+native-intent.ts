/**
 * Normalises incoming deep-link / app-link URLs to an in-app route.
 *
 * A shared promotion link can arrive as either:
 *   - GLAPP://promotion/<CODE>                                   (custom scheme)
 *   - https://glappbackend.pythonanywhere.com/promotion/<CODE>   (https fallback)
 *
 * Both should land on the `/promotion/[code]` screen whether the app was closed
 * (initial URL), backgrounded, or already open.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    const match = path.match(/\/promotion\/([A-Za-z0-9]+)/);
    if (match) return `/promotion/${match[1]}`;
    return path;
  } catch {
    return path;
  }
}
