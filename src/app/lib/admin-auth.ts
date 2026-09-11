import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "donanim_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value: string) {
  return toHex(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(value)
    )
  );
}

async function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET tanımlı değil.");
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  return toHex(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(value)
    )
  );
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let difference = 0;
  for (let index = 0; index < left.length; index++) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

export async function passwordMatches(enteredPassword: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !enteredPassword) return false;

  const [enteredHash, passwordHash] = await Promise.all([
    sha256(enteredPassword),
    sha256(password),
  ]);

  return constantTimeEqual(enteredHash, passwordHash);
}

export async function createAdminSessionToken() {
  const issuedAt = Date.now().toString();
  const nonce = crypto.randomUUID();
  const payload = `${issuedAt}.${nonce}`;
  const signature = await sign(payload);

  return `${payload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string) {
  try {
    const [issuedAtRaw, nonce, signature, ...extra] = token.split(".");
    if (!issuedAtRaw || !nonce || !signature || extra.length) return false;

    const issuedAt = Number(issuedAtRaw);
    const age = Date.now() - issuedAt;
    const maxAge = ADMIN_SESSION_MAX_AGE_SECONDS * 1000;

    if (!Number.isFinite(issuedAt) || age < -60_000 || age > maxAge) {
      return false;
    }

    const expectedSignature = await sign(`${issuedAtRaw}.${nonce}`);
    return constantTimeEqual(signature, expectedSignature);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value || "";
  return verifyAdminSessionToken(token);
}
