import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer with filter byte 0 at start of each scanline
  const scanlineLength = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Compress IDAT
  const compressed = zlib.deflateSync(rawData);

  // Helper to create chunk
  function chunk(type, data) {
    const typeBuf = Buffer.from(type);
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeInt32BE(crc, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = chunk('IHDR', ihdr);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

// CRC-32 table calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// Draw standard RT Lab icon
function drawRTIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.min(w, h) * 0.44;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background rounded squircle / gradient
  const bgGrad = y / h;
  const bgR = Math.round(4 + bgGrad * (15 - 4));
  const bgG = Math.round(120 - bgGrad * 60);
  const bgB = Math.round(80 + bgGrad * 40);

  // Shield boundary calculation
  const shieldTop = h * 0.16;
  const shieldBottom = h * 0.84;
  const shieldWidth = w * 0.68;
  const inShieldY = y >= shieldTop && y <= shieldBottom;
  const normY = (y - shieldTop) / (shieldBottom - shieldTop);
  const allowedHalfW = (shieldWidth / 2) * (normY < 0.5 ? 1 : Math.max(0, 1 - Math.pow((normY - 0.5) * 2, 1.8)));
  const inShield = inShieldY && Math.abs(dx) <= allowedHalfW;

  // Medical Cross
  const crossW = w * 0.08;
  const crossH = h * 0.24;
  const inVertCross = Math.abs(dx) <= crossW / 2 && Math.abs(y - h * 0.42) <= crossH / 2;
  const inHorizCross = Math.abs(dx) <= crossH / 2 && Math.abs(y - h * 0.42) <= crossW / 2;
  const inCross = inVertCross || inHorizCross;

  // Inner border of shield
  const isBorder = inShield && (Math.abs(Math.abs(dx) - allowedHalfW) < (w * 0.02) || Math.abs(y - shieldTop) < (h * 0.02));

  if (inCross) {
    // Gold cross
    return [245, 158, 11, 255];
  } else if (isBorder) {
    // Gold border
    return [217, 119, 6, 255];
  } else if (inShield) {
    // Deep emerald inside shield
    return [2, 44, 34, 255];
  } else {
    // Outer gradient
    return [bgR, bgG, bgB, 255];
  }
}

// Generate files
const sizes = [
  { name: 'public/pwa-192x192.png', size: 192 },
  { name: 'public/pwa-512x512.png', size: 512 },
  { name: 'public/apple-touch-icon.png', size: 180 },
  { name: 'public/pwa-maskable-512x512.png', size: 512 },
];

for (const s of sizes) {
  const buf = createPNG(s.size, s.size, drawRTIcon);
  fs.writeFileSync(s.name, buf);
  console.log(`Generated ${s.name} (${s.size}x${s.size})`);
}
