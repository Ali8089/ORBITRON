/** Generate a random hex string of the given length (default 64). */
export function randomHex(len = 64): string {
  const chars = '0123456789abcdef';
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * 16)]).join('');
}
