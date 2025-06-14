// Helper to update the WAV header after merging audio data
function updateWavHeader(buffer) {
  const view = new DataView(buffer.buffer);
  // Update file size at byte 4 (file size - 8)
  view.setUint32(4, buffer.length - 8, true);
  // Update data chunk size at byte 40 (data size)
  view.setUint32(40, buffer.length - 44, true);
  return buffer;
}

// Main function to merge base64 WAV segments and return a Blob
export function mergeBase64WavSegmentsToBlob(base64Audios) {
  if (!Array.isArray(base64Audios) || base64Audios.length === 0) return null;

  const buffers = base64Audios.map(b64 =>
    Uint8Array.from(atob(b64), c => c.charCodeAt(0))
  );

  // Keep header from first, strip from rest
  const mergedParts = [buffers[0]];
  for (let i = 1; i < buffers.length; i++) {
    mergedParts.push(buffers[i].slice(44));
  }

  const totalLength = mergedParts.reduce((sum, arr) => sum + arr.length, 0);
  const merged = new Uint8Array(totalLength);

  let offset = 0;
  for (const part of mergedParts) {
    merged.set(part, offset);
    offset += part.length;
  }

  updateWavHeader(merged);

  return new Blob([merged], { type: 'audio/wav' });
}