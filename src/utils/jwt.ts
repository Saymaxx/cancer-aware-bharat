// Client-side only: decodes the JWT payload to read its `exp` claim, never
// verifies the signature. This is purely a UX guard (skip rendering a
// dashboard shell for a token that's already expired) -- the backend
// independently re-validates every token on every request regardless, so a
// forged or tampered payload here can't grant access to anything real.
export function isTokenExpired(token: string): boolean {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return true;
    const json = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    if (typeof payload.exp !== 'number') return false;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
