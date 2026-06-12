import { showToast, copyToClipboard } from '../app.js';

export default {
  id: 'color-converter',
  name: '颜色转换',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '🔄',
  icon: '🎨',
  description: 'HEX、RGB、RGBA、HSL、HSLA 颜色格式互相转换',
  render() {
    return `
      <div class="tool-card">
        <label>输入颜色</label>
        <div class="inline-row">
          <input type="text" id="color-input" class="tool-input" placeholder="例如: #ff6600, rgb(255,102,0), hsl(24,100%,50%)">
          <button class="btn btn-primary" id="color-convert">转换</button>
        </div>
      </div>
      <div class="tool-card">
        <div class="color-preview-box" id="color-preview"></div>
        <div class="color-values-grid" id="color-values"></div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#color-input');
    const preview = container.querySelector('#color-preview');
    const values = container.querySelector('#color-values');

    function parseColor(str) {
      str = str.trim().toLowerCase();
      let r, g, b, a = 1;

      if (str.startsWith('#')) {
        const hex = str.slice(1);
        if (hex.length === 3) {
          r = parseInt(hex[0] + hex[0], 16);
          g = parseInt(hex[1] + hex[1], 16);
          b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
        } else if (hex.length === 8) {
          r = parseInt(hex.slice(0, 2), 16);
          g = parseInt(hex.slice(2, 4), 16);
          b = parseInt(hex.slice(4, 6), 16);
          a = Math.round((parseInt(hex.slice(6, 8), 16) / 255) * 100) / 100;
        } else return null;
      } else if (str.startsWith('rgb')) {
        const m = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
        if (!m) return null;
        r = parseInt(m[1]); g = parseInt(m[2]); b = parseInt(m[3]);
        if (m[4] !== undefined) a = parseFloat(m[4]);
      } else if (str.startsWith('hsl')) {
        const m = str.match(/hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%?\s*,\s*([\d.]+)%?\s*(?:,\s*([\d.]+))?\s*\)/);
        if (!m) return null;
        const h = parseFloat(m[1]) / 360, s = parseFloat(m[2]) / 100, l = parseFloat(m[3]) / 100;
        if (m[4] !== undefined) a = parseFloat(m[4]);
        if (s === 0) { r = g = b = Math.round(l * 255); }
        else {
          const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1; if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
          };
          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = Math.round(hue2rgb(p, q, h + 1/3) * 255);
          g = Math.round(hue2rgb(p, q, h) * 255);
          b = Math.round(hue2rgb(p, q, h - 1/3) * 255);
        }
      } else return null;

      if (r === undefined || g === undefined || b === undefined) return null;
      if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return null;
      return { r, g, b, a: Math.min(Math.max(a, 0), 1) };
    }

    function toHex(r, g, b, a) {
      const hex = '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
      if (a < 1) return hex + Math.round(a * 255).toString(16).padStart(2, '0');
      return hex;
    }

    function toRgb(r, g, b, a) {
      if (a < 1) return `rgba(${r}, ${g}, ${b}, ${a})`;
      return `rgb(${r}, ${g}, ${b})`;
    }

    function toHsl(r, g, b, a) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      h = Math.round(h * 360); s = Math.round(s * 100); l = Math.round(l * 100);
      if (a < 1) return `hsla(${h}, ${s}%, ${l}%, ${a})`;
      return `hsl(${h}, ${s}%, ${l}%)`;
    }

    function convert() {
      const color = parseColor(input.value);
      if (!color) { showToast('无法解析颜色', 'error'); return; }
      const { r, g, b, a } = color;
      preview.style.background = toRgb(r, g, b, a);
      const formats = [
        { label: 'HEX', value: toHex(r, g, b, a) },
        { label: 'RGB', value: toRgb(r, g, b, a) },
        { label: 'HSL', value: toHsl(r, g, b, a) },
      ];
      values.innerHTML = formats.map(f => `
        <div class="color-value-item">
          <span>${f.label}: <strong>${f.value}</strong></span>
          <button class="copy-color-btn" data-value="${f.value}" title="复制">📋</button>
        </div>
      `).join('');
      values.querySelectorAll('.copy-color-btn').forEach(btn => {
        btn.addEventListener('click', () => copyToClipboard(btn.dataset.value, '已复制'));
      });
    }

    container.querySelector('#color-convert').addEventListener('click', convert);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') convert(); });
  }
};
