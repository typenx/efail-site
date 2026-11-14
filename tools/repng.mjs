// Recompress the engine's stored PNGs (8-bit, non-interlaced) at zlib level 9.
import fs from 'fs'; import zlib from 'zlib';
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc = b => { let c = -1; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
const chunk = (t, d) => { const o = Buffer.alloc(12 + d.length); o.writeUInt32BE(d.length, 0); o.write(t, 4, 'latin1'); d.copy(o, 8); o.writeUInt32BE(crc(o.subarray(4, 8 + d.length)), 8 + d.length); return o; };
const [, , inp, out] = process.argv; const b = fs.readFileSync(inp);
let p = 8, ihdr, idat = [];
while (p < b.length) { const n = b.readUInt32BE(p), t = b.toString('latin1', p + 4, p + 8), d = b.subarray(p + 8, p + 8 + n); if (t === 'IHDR') ihdr = d; if (t === 'IDAT') idat.push(d); p += 12 + n; }
const raw = zlib.inflateSync(Buffer.concat(idat));
console.log(inp, 'depth', ihdr[8], 'color', ihdr[9], 'interlace', ihdr[12]);
fs.writeFileSync(out, Buffer.concat([b.subarray(0, 8), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
