// Session cookie for the private area, backed by real per-user accounts
// (see lib/password.ts for credential hashing). The cookie carries the
// signed-in user's id and an expiry, HMAC-signed so the edge proxy can
// validate it without a DB round-trip.

export const PRIVATE_COOKIE_NAME = "private_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function computeSessionToken(
  sessionSecret: string,
  userId: string
): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  const signature = await hmacHex(sessionSecret, payload);
  return `${payload}.${signature}`;
}

export async function getSessionUserId(
  token: string | undefined | null,
  sessionSecret: string | undefined
): Promise<string | null> {
  if (!token || !sessionSecret) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, expiresAtRaw, signature] = parts;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  const payload = `${userId}.${expiresAtRaw}`;
  const expectedSignature = await hmacHex(sessionSecret, payload);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  return userId;
}
