window.RS = window.RS || {};

/** Suelo pixel: pintura de floor de PokéSurvivor (Bosque Umbrío), sin paredes ni líquidos. */
RS.Ground = (() => {
  const T = 16;
  const PX = 2;
  const TS = T * PX;
  const SEED = 1;
  const B = {
    floor: ["#3e7a39", "#44813d", "#397134"],
    dirt: ["#7d6742", "#735e3b", "#86704a"],
    speck: "#2f5f2b",
    light: "#5f9d50",
    flowers: ["#f4d65c", "#f39ac0", "#eef2ff"],
  };

  let canvas = null;
  let bakedFor = 0;

  function hash(x, y, seed = 0) {
    let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2246822519);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function pack(hex) {
    const n = parseInt(hex.slice(1), 16);
    return (255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255);
  }

  function Pix(w, h) {
    const cv = document.createElement("canvas");
    cv.width = w;
    cv.height = h;
    const c = cv.getContext("2d");
    const img = c.createImageData(w, h);
    const buf = new Uint32Array(img.data.buffer);
    return {
      set(x, y, col) {
        if (x >= 0 && y >= 0 && x < w && y < h) buf[y * w + x] = col;
      },
      canvas() {
        c.putImageData(img, 0, 0);
        return cv;
      },
    };
  }

  function vnoise(x, y, s) {
    const xi = Math.floor(x),
      yi = Math.floor(y);
    const xf = x - xi,
      yf = y - yi;
    const u = xf * xf * (3 - 2 * xf),
      v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s),
      b = hash(xi + 1, yi, s),
      c = hash(xi, yi + 1, s),
      d = hash(xi + 1, yi + 1, s);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  }
  const fbm = (x, y, s) => vnoise(x, y, s) * 0.65 + vnoise(x * 2.13 + 17, y * 2.13 - 9, s + 1) * 0.35;

  function dirtMask(gx0, gy0, W, field) {
    const S = 4,
      gw = W / S + 3;
    const grid = new Float32Array(gw * gw);
    for (let j = 0; j < gw; j++) for (let i = 0; i < gw; i++) grid[j * gw + i] = field(gx0 + (i - 1) * S, gy0 + (j - 1) * S);
    const mask = new Uint8Array(W * (W + 1));
    for (let y = -1; y < W; y++) {
      const fy = (y + S) / S,
        j = Math.floor(fy),
        v = fy - j;
      for (let x = 0; x < W; x++) {
        const fx = (x + S) / S,
          i = Math.floor(fx),
          u = fx - i;
        const a = grid[j * gw + i],
          b = grid[j * gw + i + 1];
        const c = grid[(j + 1) * gw + i],
          d = grid[(j + 1) * gw + i + 1];
        let val = (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
        val += (hash((gx0 + x) >> 1, (gy0 + y) >> 1, SEED + 9) - 0.5) * 0.05;
        mask[(y + 1) * W + x] = val > 0.64 ? 1 : 0;
      }
    }
    return (x, y) => mask[(y + 1) * W + x] === 1;
  }

  function paintFloor(P, C, ox, oy, tx, ty, dirtAt) {
    let dirtCount = 0;
    for (let y = 0; y < T; y++) {
      for (let x = 0; x < T; x++) {
        const gx = tx * T + x,
          gy = ty * T + y;
        const lx = ox + x,
          ly = oy + y;
        const dirt = dirtAt(lx, ly);
        if (dirt) dirtCount++;
        const pal = dirt ? C.dirt : C.floor;
        const band = hash(gx >> 3, gy >> 3, 11) * 0.7 + hash(gx, gy, 12) * 0.5;
        let col = pal[Math.min(pal.length - 1, Math.floor((band * pal.length) / 1.2))];
        const r = hash(gx, gy, 13);
        if (r < 0.035) col = C.speck;
        else if (r > 0.985) col = C.light;
        if (dirt && !dirtAt(lx, ly - 1)) col = C.speck;
        else if (!dirt && dirtAt(lx, ly - 1) && r < 0.5) col = C.light;
        P.set(ox + x, oy + y, col);
      }
    }
    const dirt = dirtCount > (T * T) / 2;
    const d = hash(tx, ty, 14);
    const dx = ox + 3 + Math.floor(hash(tx, ty, 15) * 10);
    const dy = oy + 4 + Math.floor(hash(tx, ty, 16) * 9);
    if (dirt) {
      if (d < 0.22) {
        P.set(dx, dy, C.light);
        P.set(dx + 1, dy, C.light);
        P.set(dx, dy + 1, C.speck);
        P.set(dx + 1, dy + 1, C.speck);
      }
      return;
    }
    if (d < 0.18) {
      P.set(dx, dy, C.light);
      P.set(dx - 1, dy - 1, C.light);
      P.set(dx + 1, dy - 1, C.light);
      P.set(dx, dy - 2, C.light);
      P.set(dx, dy + 1, C.speck);
    } else if (d < 0.26) {
      const fc = C.flowers[Math.floor(hash(tx, ty, 17) * C.flowers.length)];
      P.set(dx, dy - 1, fc);
      P.set(dx - 1, dy, fc);
      P.set(dx + 1, dy, fc);
      P.set(dx, dy + 1, fc);
      P.set(dx, dy, C.light);
    } else if (d < 0.32) {
      P.set(dx, dy, C.light);
      P.set(dx + 1, dy, C.light);
      P.set(dx, dy + 1, C.speck);
      P.set(dx + 1, dy + 1, C.speck);
    }
  }

  function bake(worldSize) {
    // shortcut: arena fija divisible por el tile de mundo; si cambia el tamaño, ajustar TS o world.size
    console.assert(worldSize % TS === 0, "world.size must be multiple of tile", TS);
    const n = worldSize / TS;
    const art = n * T;
    const P = Pix(art, art);
    const C = {
      floor: B.floor.map(pack),
      dirt: B.dirt.map(pack),
      speck: pack(B.speck),
      light: pack(B.light),
      flowers: B.flowers.map(pack),
    };
    const S = 6 * T;
    const dirtField = (gx, gy) => fbm(gx / S, gy / S, SEED + 303);
    const dirtAt = dirtMask(0, 0, art, dirtField);
    for (let ty = 0; ty < n; ty++) {
      for (let tx = 0; tx < n; tx++) paintFloor(P, C, tx * T, ty * T, tx, ty, dirtAt);
    }
    const artCv = P.canvas();
    const out = document.createElement("canvas");
    out.width = worldSize;
    out.height = worldSize;
    const g = out.getContext("2d");
    g.imageSmoothingEnabled = false;
    g.drawImage(artCv, 0, 0, worldSize, worldSize);
    canvas = out;
    bakedFor = worldSize;
  }

  return {
    ensure(worldSize) {
      if (!canvas || bakedFor !== worldSize) bake(worldSize);
      return canvas;
    },
  };
})();
