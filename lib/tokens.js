import crypto from "crypto";

export function createAccessToken() {
  return crypto.randomBytes(32).toString("base64url");
}
