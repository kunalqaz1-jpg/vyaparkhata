import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.44;
  const innerCircleR = width * 0.22;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let r = 37, g = 99, b = 235, a = 255; // Blue #2563eb

      if (!isMaskable && dist > radius) {
        // Transparent outside rounded icon
        r = 0; g = 0; b = 0; a = 0;
      } else {
        // Inner circle badge (emerald #10b981)
        if (dist <= innerCircleR) {
          r = 16; g = 185; b = 129; a = 255;
          // Rupee bar accents in white
          const inRupeeBar1 = Math.abs(dy + width * 0.05) < width * 0.02 && Math.abs(dx) < width * 0.12;
          const inRupeeBar2 = Math.abs(dy - width * 0.01) < width * 0.02 && Math.abs(dx) < width * 0.12;
          const inRupeeStem = Math.abs(dx + width * 0.05) < width * 0.02 && dy > -width * 0.06 && dy < width * 0.14;
          if (inRupeeBar1 || inRupeeBar2 || inRupeeStem) {
            r = 255; g = 255; b = 255; a = 255;
          }
        } else {
          // White ledger book shape
          const inBook = Math.abs(dx) < width * 0.32 && Math.abs(dy) < height * 0.32;
          if (inBook) {
            r = 255; g = 255; b = 255; a = 255;
            // Book spine in dark slate
            if (dx < -width * 0.22) {
              r = 30; g = 41; b = 59; a = 255;
            }
          }
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, false));

console.log('Successfully generated PWA icon assets in /public');
