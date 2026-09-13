/**
 * The JWT signing secret. In production a missing AUTH_SECRET must be a hard
 * failure — a hardcoded fallback would let anyone forge session cookies.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET is not set. Generate one with `npx auth secret`.')
  }
  return 'dev-only-insecure-secret'
}
