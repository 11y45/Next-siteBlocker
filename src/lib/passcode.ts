// No look-alike characters (0/O, 1/I/L). 31 symbols x 16 chars is roughly 79 bits of entropy.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const LENGTH = 16;

// Random bytes above this limit are thrown away, so every symbol is exactly equally likely (256 is not a multiple of 31).
const LIMIT = 256 - (256 % ALPHABET.length);

export function generatePasscode(): string {
  const chars: string[] = [];
  while (chars.length < LENGTH) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    for (const b of bytes) {
      if (b < LIMIT && chars.length < LENGTH) chars.push(ALPHABET[b % ALPHABET.length]);
    }
  }
  return [0, 4, 8, 12].map((i) => chars.slice(i, i + 4).join("")).join("-");
}
