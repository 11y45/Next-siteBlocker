// No look-alike characters (0/O, 1/I/L). 31 symbols x 16 chars is roughly 79 bits of entropy.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generatePasscode(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}
