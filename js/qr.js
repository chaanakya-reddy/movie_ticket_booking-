// Lightweight self-contained QR Code Matrix Generator for CinePass Tickets
// Generates standard QR Code 21x21 to 29x29 matrix onto HTML5 Canvas
(function (global) {
  // Simple, robust QR Code Model 2 generator
  const QR = {};

  // Standard Reed-Solomon GF(256) Log & Exp tables
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initGalois() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 256) x ^= 0x11d;
    }
    for (let i = 255; i < 512; i++) {
      EXP[i] = EXP[i - 255];
    }
  })();

  function gfMul(x, y) {
    if (x === 0 || y === 0) return 0;
    return EXP[LOG[x] + LOG[y]];
  }

  function getPoly(degree) {
    let poly = [1];
    for (let i = 0; i < degree; i++) {
      const next = [1];
      for (let j = 1; j <= poly.length; j++) {
        const a = (j < poly.length ? poly[j] : 0);
        const b = gfMul(poly[j - 1], EXP[i]);
        next.push(a ^ b);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecLen) {
    const poly = getPoly(ecLen);
    const result = new Uint8Array(data.length + ecLen);
    result.set(data, 0);

    for (let i = 0; i < data.length; i++) {
      const coef = result[i];
      if (coef !== 0) {
        for (let j = 0; j < poly.length; j++) {
          result[i + j] ^= gfMul(poly[j], coef);
        }
      }
    }
    return result.slice(data.length);
  }

  // Draw QR pattern on canvas
  QR.draw = function (canvas, text, options) {
    options = options || {};
    const size = options.size || 200;
    const darkColor = options.darkColor || '#0a0d14';
    const lightColor = options.lightColor || '#ffffff';

    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    // Choose QR version
    const encoder = new TextEncoder();
    let textBytes = encoder.encode(text || 'CP-PASS');
    const version = textBytes.length > 32 ? 4 : (textBytes.length > 14 ? 3 : 2);
    const moduleCount = 17 + 4 * version;

    const ecCapacities = {
      2: { data: 28, ec: 16 },
      3: { data: 44, ec: 26 },
      4: { data: 64, ec: 36 }
    };
    const cap = ecCapacities[version];
    if (textBytes.length > cap.data - 3) {
      textBytes = textBytes.slice(0, cap.data - 3);
    }

    // Initialize module grid: 0=light, 1=dark, -1=empty
    const grid = [];
    for (let r = 0; r < moduleCount; r++) {
      grid[r] = new Int8Array(moduleCount);
      grid[r].fill(-1);
    }

    // 1. Finder patterns (7x7 with 1 border)
    function setFinder(row, col) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const nr = row + r;
          const nc = col + c;
          if (nr < 0 || nr >= moduleCount || nc < 0 || nc >= moduleCount) continue;
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
              grid[nr][nc] = 1;
            } else {
              grid[nr][nc] = 0;
            }
          } else {
            grid[nr][nc] = 0;
          }
        }
      }
    }

    setFinder(0, 0);
    setFinder(0, moduleCount - 7);
    setFinder(moduleCount - 7, 0);

    // 2. Timing patterns
    for (let i = 8; i < moduleCount - 8; i++) {
      if (grid[6][i] === -1) grid[6][i] = (i % 2 === 0 ? 1 : 0);
      if (grid[i][6] === -1) grid[i][6] = (i % 2 === 0 ? 1 : 0);
    }

    // 3. Dark module
    grid[moduleCount - 8][8] = 1;

    // 4. Alignment pattern for v2+
    if (version >= 2) {
      const alignPos = version === 2 ? [6, 18] : (version === 3 ? [6, 22] : [6, 26]);
      const ar = alignPos[1];
      const ac = alignPos[1];
      for (let r = -2; r <= 2; r++) {
        for (let c = -2; c <= 2; c++) {
          if (grid[ar + r][ac + c] === -1) {
            grid[ar + r][ac + c] = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0)) ? 1 : 0;
          }
        }
      }
    }

    // 5. Data encoding with error correction
    // Byte Mode header: 0100 + char count (8-bit)
    const bits = [];
    function pushBits(val, len) {
      for (let i = len - 1; i >= 0; i--) {
        bits.push((val >> i) & 1);
      }
    }
    pushBits(4, 4); // Byte mode indicator
    pushBits(textBytes.length, 8); // Length
    for (let i = 0; i < textBytes.length; i++) {
      pushBits(textBytes[i], 8);
    }
    // Terminator
    pushBits(0, 4);
    while (bits.length % 8 !== 0) bits.push(0);

    // Pad bytes
    const pad = [0xec, 0x11];
    let padIdx = 0;
    while (bits.length / 8 < cap.data) {
      pushBits(pad[padIdx % 2], 8);
      padIdx++;
    }

    const dataBytes = new Uint8Array(cap.data);
    for (let i = 0; i < cap.data; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) {
        b = (b << 1) | bits[i * 8 + j];
      }
      dataBytes[i] = b;
    }

    const ecBytes = rsEncode(dataBytes, cap.ec);
    const finalBits = [];
    for (let i = 0; i < dataBytes.length; i++) pushBits(dataBytes[i], 8);
    for (let i = 0; i < ecBytes.length; i++) pushBits(ecBytes[i], 8);

    // 6. Place data into grid
    let bitIndex = 0;
    let up = true;
    for (let right = moduleCount - 1; right > 0; right -= 2) {
      if (right === 6) right--; // skip timing col
      const left = right - 1;
      const rowRange = up ? Array.from({ length: moduleCount }, (_, i) => moduleCount - 1 - i) : Array.from({ length: moduleCount }, (_, i) => i);
      
      for (const r of rowRange) {
        for (const c of [right, left]) {
          if (grid[r][c] === -1) {
            let bit = 0;
            if (bitIndex < finalBits.length) {
              bit = finalBits[bitIndex++];
            }
            // Standard QR mask 0: (row + col) % 2 === 0
            const mask = ((r + c) % 2 === 0) ? 1 : 0;
            grid[r][c] = bit ^ mask;
          }
        }
      }
      up = !up;
    }

    // Format info (Mask 0, EC level M) -> format bits
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
    for (let i = 0; i < 6; i++) grid[8][i] = formatBits[i];
    grid[8][7] = formatBits[6];
    grid[8][8] = formatBits[7];
    grid[7][8] = formatBits[8];
    for (let i = 9; i < 15; i++) grid[14 - i][8] = formatBits[i];

    for (let i = 0; i < 8; i++) grid[moduleCount - 1 - i][8] = formatBits[i];
    for (let i = 8; i < 15; i++) grid[8][moduleCount - 15 + i] = formatBits[i];

    // Render cleanly onto canvas with high-DPI quiet zone
    const quietZone = 2;
    const totalModules = moduleCount + quietZone * 2;
    const modulePx = size / totalModules;

    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = darkColor;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (grid[r][c] === 1) {
          ctx.beginPath();
          // Draw neat rounded modules for modern ticket look
          const x = (c + quietZone) * modulePx;
          const y = (r + quietZone) * modulePx;
          ctx.rect(Math.round(x), Math.round(y), Math.ceil(modulePx), Math.ceil(modulePx));
          ctx.fill();
        }
      }
    }
  };

  global.CineQR = QR;
})(window);
