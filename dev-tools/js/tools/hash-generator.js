import { showToast, copyToClipboard } from '../app.js';

export default {
  id: 'hash-generator',
  name: 'Hash 生成器',
  category: 'generators',
  categoryName: '生成',
  categoryIcon: '⚡',
  icon: '🔐',
  description: '计算文本的 MD5、SHA1、SHA256、SHA512 哈希值',
  render() {
    return `
      <div class="tool-card">
        <label>输入文本</label>
        <textarea id="hash-input" class="tool-textarea" placeholder="输入要计算哈希的文本..."></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="hash-calculate">计算</button>
          <button class="btn btn-secondary" id="hash-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>哈希值</label>
        <div class="hash-output-grid" id="hash-output">
          <div class="hash-row"><span class="hash-label">MD5</span><span class="hash-value" id="hash-md5">-</span><button class="hash-copy" data-target="hash-md5" title="复制">📋</button></div>
          <div class="hash-row"><span class="hash-label">SHA1</span><span class="hash-value" id="hash-sha1">-</span><button class="hash-copy" data-target="hash-sha1" title="复制">📋</button></div>
          <div class="hash-row"><span class="hash-label">SHA256</span><span class="hash-value" id="hash-sha256">-</span><button class="hash-copy" data-target="hash-sha256" title="复制">📋</button></div>
          <div class="hash-row"><span class="hash-label">SHA512</span><span class="hash-value" id="hash-sha512">-</span><button class="hash-copy" data-target="hash-sha512" title="复制">📋</button></div>
        </div>
      </div>
    `;
  },
  async init(container) {
    const input = container.querySelector('#hash-input');

    async function sha256(message) {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function sha1(message) {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function sha512(message) {
      const msgUint8 = new TextEncoder().encode(message);
      const hashBuffer = await crypto.subtle.digest('SHA-512', msgUint8);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function md5(message) {
      function md5cycle(x, k) {
        let a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
      }
      function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
      function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
      function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
      function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
      function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
      function add32(a, b) { return (a + b) & 0xFFFFFFFF; }

      const msg = unescape(encodeURIComponent(message));
      const l = msg.length;
      const w = [];
      for (let i = 0; i < 16; i++) w[i] = 0;
      for (let i = 0; i < l; i++) w[i >> 2] |= (msg.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
      w[l >> 2] |= 0x80 << ((l % 4) * 8);
      w[((l + 8) >> 6 << 4) + 14] = l * 8;

      const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
      for (let i = 0; i < w.length; i += 16) {
        const k = w.slice(i, i + 16);
        const x = [h[0], h[1], h[2], h[3]];
        md5cycle(x, k);
        h[0] = add32(h[0], x[0]); h[1] = add32(h[1], x[1]); h[2] = add32(h[2], x[2]); h[3] = add32(h[3], x[3]);
      }
      return h.map(v => ('00000000' + (v >>> 0).toString(16)).slice(-8)).join('');
    }

    async function calculate() {
      const text = input.value;
      if (!text) { showToast('请输入文本', 'error'); return; }
      container.querySelector('#hash-md5').textContent = md5(text);
      container.querySelector('#hash-sha1').textContent = await sha1(text);
      container.querySelector('#hash-sha256').textContent = await sha256(text);
      container.querySelector('#hash-sha512').textContent = await sha512(text);
    }

    container.querySelector('#hash-calculate').addEventListener('click', calculate);

    container.querySelector('#hash-clear').addEventListener('click', () => {
      input.value = '';
      container.querySelectorAll('.hash-value').forEach(el => el.textContent = '-');
    });

    container.querySelectorAll('.hash-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = container.querySelector(`#${btn.dataset.target}`).textContent;
        if (val && val !== '-') copyToClipboard(val, '已复制');
      });
    });
  }
};
