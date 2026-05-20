// 1x1 transparent PNG
export const PNG_BYTES = Uint8Array.from([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0,
  0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 0, 1, 0, 0, 5, 0, 1, 13, 10, 45,
  180, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
]);

// Minimal valid MP3 frame header + silence (~1s @ 8kbps mono).
export const MP3_BYTES = new Uint8Array(256);
MP3_BYTES.set([0xff, 0xfb, 0x10, 0x64]);

export const CANNED_TEXT = (prompt: string) =>
  `Mock text response for prompt: "${prompt.slice(0, 80)}"`;
