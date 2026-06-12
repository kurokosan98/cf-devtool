const QR = (() => {
  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function() {
    let v = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = v; LOG[v] = i;
      v = (v << 1) ^ (v >= 256 ? 0x11d : 0);
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function gfMul(a, b) {
    return a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]];
  }

  function rsEncode(data, eccCount) {
    const gen = [1];
    for (let i = 0; i < eccCount; i++) {
      gen.push(0);
      for (let j = gen.length - 1; j > 0; j--)
        gen[j] = gen[j - 1] ^ gfMul(gen[j], EXP[i]);
      gen[0] = gfMul(gen[0], EXP[i]);
    }
    const result = data.slice();
    for (let i = 0; i < data.length; i++) {
      if (result[i]) {
        const f = result[i];
        for (let j = 0; j < eccCount; j++)
          result[i + j] ^= gfMul(gen[j], f);
      }
    }
    return result.slice(data.length);
  }

  class BitBuf {
    constructor() { this.bits = []; }
    add(v, n) {
      for (let i = n - 1; i >= 0; i--) this.bits.push((v >> i) & 1);
    }
    toBytes() {
      const r = [];
      for (let i = 0; i < this.bits.length; i += 8) {
        let b = 0;
        for (let j = 0; j < 8 && i + j < this.bits.length; j++)
          b = (b << 1) | this.bits[i + j];
        if (i + 8 > this.bits.length) b <<= (8 - (this.bits.length - i));
        r.push(b);
      }
      return r;
    }
  }

  const EC_MAP = { L: 0, M: 1, Q: 2, H: 3 };

  const VINFO = [
    null, null,
    { v:1,s:21, g:[{n:1,d:19,e:7}] },
    { v:2,s:25, g:[{n:1,d:34,e:10}] },
    { v:3,s:29, g:[{n:1,d:55,e:15}] },
    { v:4,s:33, g:[{n:2,d:32,e:20}] },
    { v:5,s:37, g:[{n:2,d:43,e:26}] },
    { v:6,s:41, g:[{n:4,d:27,e:18}] },
    { v:7,s:45, g:[{n:4,d:31,e:20}] },
    { v:8,s:49, g:[{n:4,d:38,e:24}] },
    { v:9,s:53, g:[{n:5,d:36,e:30}] },
    { v:10,s:57, g:[{n:5,d:48,e:18}] },
    { v:11,s:61, g:[{n:5,d:51,e:20}] },
    { v:12,s:65, g:[{n:6,d:48,e:24}] },
    { v:13,s:69, g:[{n:7,d:45,e:26}] },
    { v:14,s:73, g:[{n:8,d:42,e:20}] },
    { v:15,s:77, g:[{n:8,d:43,e:26}] },
    { v:16,s:81, g:[{n:10,d:36,e:24}] },
    { v:17,s:85, g:[{n:11,d:36,e:28}] },
    { v:18,s:89, g:[{n:13,d:36,e:30}] },
    { v:19,s:93, g:[{n:14,d:36,e:28}] },
    { v:20,s:97, g:[{n:16,d:35,e:28}] },
    { v:21,s:101, g:[{n:17,d:33,e:26}] },
    { v:22,s:105, g:[{n:17,d:31,e:24}] },
    { v:23,s:109, g:[{n:18,d:31,e:30}] },
    { v:24,s:113, g:[{n:20,d:29,e:28}] },
    { v:25,s:117, g:[{n:21,d:28,e:32}] },
    { v:26,s:121, g:[{n:23,d:28,e:28}] },
    { v:27,s:125, g:[{n:25,d:27,e:30}] },
    { v:28,s:129, g:[{n:26,d:27,e:28}] },
    { v:29,s:133, g:[{n:28,d:25,e:24}] },
    { v:30,s:137, g:[{n:29,d:25,e:20}] },
    { v:31,s:141, g:[{n:31,d:24,e:30}] },
    { v:32,s:145, g:[{n:33,d:24,e:26}] },
    { v:33,s:149, g:[{n:35,d:23,e:40}] },
    { v:34,s:153, g:[{n:37,d:23,e:32}] },
    { v:35,s:157, g:[{n:38,d:23,e:36}] },
    { v:36,s:161, g:[{n:40,d:22,e:38}] },
    { v:37,s:165, g:[{n:43,d:22,e:42}] },
    { v:38,s:169, g:[{n:45,d:21,e:38}] },
    { v:39,s:173, g:[{n:47,d:21,e:42}] },
    { v:40,s:177, g:[{n:49,d:20,e:36}] },
  ];

  function genDataStream(text) {
    const raw = new TextEncoder().encode(text);
    const bb = new BitBuf();
    bb.add(64, 8);
    bb.add(raw.length, 8);
    for (const b of raw) bb.add(b, 8);
    bb.add(0, 4);
    return bb.toBytes();
  }

  function interleave(data, ver, ecIdx) {
    const vi = VINFO[ver];
    if (!vi) return null;
    const groups = vi.g;
    const ecLen = groups[0].e;
    const blocks = [];
    let pos = 0;
    for (const g of groups) {
      for (let i = 0; i < g.n; i++) {
        const d = data.slice(pos, pos + g.d);
        pos += g.d;
        const ecc = rsEncode(d, ecLen);
        blocks.push({ d, ecc });
      }
    }
    const maxD = Math.max(...blocks.map(b => b.d.length));
    const result = [];
    for (let i = 0; i < maxD; i++)
      for (const b of blocks) if (i < b.d.length) result.push(b.d[i]);
    for (let i = 0; i < ecLen; i++)
      for (const b of blocks) if (i < b.ecc.length) result.push(b.ecc[i]);
    return result;
  }

  const ALIGN = {
    2:[18,22],3:[22,24],4:[26,26],5:[30,28],6:[34,30],
    7:[22,38,22,38],8:[24,42,24,42],9:[26,46,26,46],10:[28,50,28,50],
    11:[30,54,30,54],12:[32,58,32,58],13:[34,62,34,62],
    14:[26,46,66,26,46,66],15:[26,48,70,26,48,70],16:[26,50,74,26,50,74],
    17:[30,54,78,30,54,78],18:[30,56,82,30,56,82],
    19:[30,58,86,30,58,86],20:[34,62,90,34,62,90],
    21:[28,50,72,92,28,50,72,92],22:[26,50,74,98,26,50,74,98],
    23:[30,54,78,102,30,54,78,102],24:[28,54,80,106,28,54,80,106],
    25:[32,58,84,110,32,58,84,110],26:[30,58,86,114,30,58,86,114],
    27:[34,62,90,118,34,62,90,118],
    28:[26,50,74,98,122,26,50,74,98,122],
    29:[30,54,78,102,126,30,54,78,102,126],
    30:[26,52,78,104,130,26,52,78,104,130],
    31:[30,56,82,108,134,30,56,82,108,134],
    32:[34,60,86,112,138,34,60,86,112,138],
    33:[30,58,86,114,142,30,58,86,114,142],
    34:[34,62,90,118,146,34,62,90,118,146],
    35:[30,54,78,102,126,150,30,54,78,102,126,150],
    36:[24,50,76,102,128,154,24,50,76,102,128,154],
    37:[28,54,80,106,132,158,28,54,80,106,132,158],
    38:[32,58,84,110,136,162,32,58,84,110,136,162],
    39:[26,52,78,104,130,156,26,52,78,104,130,156],
    40:[30,56,82,108,134,160,30,56,82,108,134,160],
  };

  function fmtPoly(ecIdx, mask) {
    const ec = [1,0,3,2];
    let v = (ec[ecIdx] << 3) | mask;
    v = (v << 10) ^ 0b101010000010010;
    const gen = 0b10100110111;
    for (let i = 0; i < 6; i++)
      if ((v >> (14 - i)) & 1) v ^= gen << (5 - i);
    return (v & 0x3FF) | (((ec[ecIdx] << 3) | mask) << 10) ^ 0b0110101000001001;
  }

  function makeMatrix(ver, ecIdx, data) {
    const vi = VINFO[ver];
    const s = vi.s;
    const M = Array.from({ length: s }, () => Array(s).fill(-1));
    const set = (r, c, v) => { if (r >= 0 && r < s && c >= 0 && c < s && M[r][c] < 0) M[r][c] = v; };

    const finder = (r, c) => {
      const p = [
        [1,1,1,1,1,1,1],[1,0,0,0,0,0,1],[1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],[1,0,1,1,1,0,1],[1,0,0,0,0,0,1],[1,1,1,1,1,1,1]];
      for (let i = -1; i <= 7; i++) { set(r+i, c-1, 0); set(r-1, c+i, 0); set(r+i, c+7, 0); set(r+7, c+i, 0); }
      for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) set(r+i, c+j, p[i][j]);
    };

    finder(0, 0); finder(0, s-7); finder(s-7, 0);

    for (let i = 0; i < 8; i++) { set(6, i, 0); set(i, 6, 0); set(6, s-1-i, 0); set(i, s-1-6, 0); set(s-1-6, i, 0); set(s-1-i, 6, 0); }
    set(6, s-1-6, 0);

    for (let i = 0; i < s; i++) { set(6, i, i % 2 ? 0 : 1); set(i, 6, i % 2 ? 0 : 1); }

    const aps = ALIGN[ver];
    if (aps) {
      const n = aps.length / 2;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          const r = aps[i*2], c = aps[j*2];
          if ((r === 6 && c === 6) || (r === 6 && c === s-7) || (r === s-7 && c === 6)) continue;
          for (let dr = -2; dr <= 2; dr++)
            for (let dc = -2; dc <= 2; dc++)
              set(r+dr, c+dc, (dr === -2 || dr === 2 || dc === -2 || dc === 2) ? 0 : 1);
          set(r, c, 0);
        }
      }
    }

    let idx = 0, dir = 1;
    for (let c = s-1; c >= 1; c -= 2) {
      if (c === 6) c = 5;
      const rows = dir === 1 ? [...Array(s).keys()] : [...Array(s).keys()].reverse();
      for (const r of rows)
        for (let dc = 0; dc < 2; dc++) {
          const col = c - dc;
          if (M[r][col] < 0 && idx < data.length) M[r][col] = data[idx++];
        }
      dir = -dir;
    }

    for (let r = 0; r < s; r++)
      for (let c = 0; c < s; c++)
        if (M[r][c] < 0) M[r][c] = 0;

    return M;
  }

  const FMASKS = [
    (r,c) => (r+c)%2===0, (r,c) => r%2===0, (r,c) => c%3===0, (r,c) => (r+c)%3===0,
    (r,c) => (Math.floor(r/2)+Math.floor(c/3))%2===0, (r,c) => (r*c)%2+(r*c)%3===0,
    (r,c) => ((r*c)%2+(r*c)%3)%2===0, (r,c) => ((r+c)%2+(r*c)%3)%2===0,
  ];

  function apply(M, ver, mi) {
    const s = VINFO[ver].s, fn = FMASKS[mi];
    for (let r = 0; r < s; r++)
      for (let c = 0; c < s; c++)
        if (fn(r, c)) M[r][c] ^= 1;
  }

  function placeFmt(M, ver, ei, mi) {
    const s = VINFO[ver].s, bits = [];
    let v = fmtPoly(ei, mi);
    for (let i = 14; i >= 0; i--) bits.push((v>>i)&1);
    const cells = [
      [8,0],[8,1],[8,2],[8,3],[8,4],[8,5],
      [8,7],[8,8],[7,8],
      [8,s-8],[8,s-7],[8,s-6],[8,s-5],[8,s-4],[8,s-3],
    ];
    for (let i = 0; i < 15; i++) {
      const [r, c] = cells[i]; M[r][c] = bits[i];
    }
    const cells2 = [
      [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
      [7,8],[8,8],[8,7],
      [s-8,8],[s-7,8],[s-6,8],[s-5,8],[s-4,8],[s-3,8],
    ];
    for (let i = 0; i < 15; i++) {
      const [r, c] = cells2[i]; M[r][c] = bits[i];
    }
    M[8][s-8] = 1;
  }

  function score(M, ver) {
    const s = VINFO[ver].s; let sco = 0;
    for (let r = 0; r < s; r++) {
      let cnt = 1, pv = M[r][0];
      for (let c = 1; c < s; c++) {
        if (M[r][c] === pv) { cnt++; }
        else { if (cnt >= 5) sco += cnt-2; cnt = 1; pv = M[r][c]; }
      }
      if (cnt >= 5) sco += cnt-2;
    }
    for (let c = 0; c < s; c++) {
      let cnt = 1, pv = M[0][c];
      for (let r = 1; r < s; r++) {
        if (M[r][c] === pv) { cnt++; }
        else { if (cnt >= 5) sco += cnt-2; cnt = 1; pv = M[r][c]; }
      }
      if (cnt >= 5) sco += cnt-2;
    }
    for (let r = 0; r < s-1; r++)
      for (let c = 0; c < s-1; c++)
        if (M[r][c]===M[r+1][c] && M[r][c]===M[r][c+1] && M[r][c]===M[r+1][c+1]) sco += 3;
    const pat = [1,0,1,1,1,0,1];
    for (let r = 0; r < s; r++)
      for (let c = 0; c < s-6; c++) {
        let m = true;
        for (let k = 0; k < 7; k++) if (M[r][c+k] !== pat[k]) { m = false; break; }
        if (m) sco += 40;
      }
    let blk = 0;
    for (let r = 0; r < s; r++) for (let c = 0; c < s; c++) if (M[r][c]) blk++;
    const pct = blk * 100 / (s * s);
    sco += Math.abs(Math.round(pct/5)*5 - 50) * 2;
    return sco;
  }

  function generate(text, ecName) {
    const ei = EC_MAP[ecName] || 1;
    let raw = genDataStream(text);
    let ver = 1;
    while (ver <= 40) {
      const vi = VINFO[ver];
      const cap = vi.g.reduce((s, g) => s + g.n * g.d, 0);
      if (raw.length <= cap) break;
      ver++;
    }
    if (ver > 40) return null;
    const vi = VINFO[ver];
    const cap = vi.g.reduce((s, g) => s + g.n * g.d, 0);
    while (raw.length < cap) raw.push(raw.length % 2 === 0 ? 0xec : 0x11);
    const interleaved = interleave(raw.slice(0, cap), ver, ei);
    if (!interleaved) return null;

    let bestM = null, bestS = Infinity;
    for (let mi = 0; mi < 8; mi++) {
      const M = makeMatrix(ver, ei, interleaved);
      apply(M, ver, mi);
      placeFmt(M, ver, ei, mi);
      const s = score(M, ver);
      if (s < bestS) { bestS = s; bestM = M.map(r => [...r]); }
    }
    return { matrix: bestM, version: ver, size: vi.s };
  }

  return { generate };
})();

export default QR;
