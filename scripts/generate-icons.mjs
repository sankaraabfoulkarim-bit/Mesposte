import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-JS PNG generator (creates valid uncompressed/DEFLATE PNG binary buffers)
function createPNG(width, height, getPixelRGBA) {
  // Raw uncompressed RGBA scanlines (with filter byte 0 at start of each line)
  const lineLength = 1 + width * 4;
  const rawData = Buffer.alloc(lineLength * height);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * lineLength;
    rawData[lineOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pixelOffset = lineOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter: Default
  ihdrData[12] = 0; // Interlace: None
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(4 + 4 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);
  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// CRC32 table & calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// Gradient & Icon drawing logic
function getVendeuseProPixel(x, y, w, h, maskable = false) {
  const nx = x / w;
  const ny = y / h;

  // Center coordinate
  const cx = 0.5;
  const cy = 0.5;
  const dx = nx - cx;
  const dy = ny - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background deep dark slate/indigo
  let r = 15;
  let g = 23;
  let b = 42;
  let a = 255;

  // If not maskable, round corners
  if (!maskable) {
    const cornerRadius = 0.22;
    const qx = Math.max(0, Math.abs(dx) - (0.5 - cornerRadius));
    const qy = Math.max(0, Math.abs(dy) - (0.5 - cornerRadius));
    const cornerDist = Math.sqrt(qx * qx + qy * qy);
    if (cornerDist > cornerRadius) {
      return [0, 0, 0, 0]; // transparent
    }
  }

  // Inner gradient aura
  if (dist < 0.42) {
    const auraFactor = (0.42 - dist) / 0.42;
    r = Math.min(255, r + auraFactor * 40);
    g = Math.min(255, g + auraFactor * 15);
    b = Math.min(255, b + auraFactor * 60);
  }

  // Camera Body Box
  const scale = maskable ? 0.75 : 0.9;
  const camX = 0.5;
  const camY = 0.52;
  const camW = 0.48 * scale;
  const camH = 0.36 * scale;

  const inCamBody =
    Math.abs(nx - camX) <= camW / 2 && Math.abs(ny - camY) <= camH / 2;

  // Lens Circle
  const lensRadius = 0.13 * scale;
  const inLens = dist <= lensRadius;
  const inLensRing = dist <= lensRadius + 0.02 * scale && dist >= lensRadius - 0.01 * scale;
  const inLensCore = dist <= 0.05 * scale;

  if (inLensCore) {
    // Dark core
    return [15, 23, 42, 255];
  }

  if (inLensRing) {
    // White border ring
    return [255, 255, 255, 255];
  }

  if (inLens) {
    // Lens reflection / warm gradient
    return [244, 63, 94, 255];
  }

  if (inCamBody) {
    // Gradient from Amber to Rose
    const t = (nx - (camX - camW / 2)) / camW;
    const cr = Math.round(245 * (1 - t) + 244 * t);
    const cg = Math.round(158 * (1 - t) + 63 * t);
    const cb = Math.round(11 * (1 - t) + 94 * t);
    return [cr, cg, cb, 255];
  }

  // Sparkle at top right
  const spX = 0.72;
  const spY = 0.26;
  const sDist = Math.hypot(nx - spX, ny - spY);
  if (sDist < 0.06) {
    const sFact = (0.06 - sDist) / 0.06;
    return [
      Math.round(253 * sFact + r * (1 - sFact)),
      Math.round(230 * sFact + g * (1 - sFact)),
      Math.round(138 * sFact + b * (1 - sFact)),
      255,
    ];
  }

  return [r, g, b, a];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate Icons
console.log('Generating PWA icons...');

const icon192 = createPNG(192, 192, (x, y, w, h) => getVendeuseProPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

const icon512 = createPNG(512, 512, (x, y, w, h) => getVendeuseProPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);

const iconMaskable192 = createPNG(192, 192, (x, y, w, h) => getVendeuseProPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192.png'), iconMaskable192);

const iconMaskable512 = createPNG(512, 512, (x, y, w, h) => getVendeuseProPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), iconMaskable512);

const appleTouchIcon = createPNG(180, 180, (x, y, w, h) => getVendeuseProPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouchIcon);

console.log('All PWA icons generated successfully in /public!');
