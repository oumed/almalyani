// Lightweight shared-password gate for the private area. Not a user-account
// system — one password, one signed cookie. Real per-user auth is a
// separate, future piece of work.

export const PRIVATE_COOKIE_NAME = "private_access";

const GRANT_MESSAGE = "granted";
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

export async function computeAccessToken(sessionSecret: string): Promise<string> {
  return hmacHex(sessionSecret, GRANT_MESSAGE);
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function isValidAccessToken(
  token: string | undefined | null,
  sessionSecret: string | undefined
): Promise<boolean> {
  if (!token || !sessionSecret) return false;
  const expected = await computeAccessToken(sessionSecret);
  return timingSafeEqual(token, expected);
}
