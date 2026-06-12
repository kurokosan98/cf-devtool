import { showToast } from '../app.js';

export default {
  id: 'qr-generator',
  name: '二维码生成',
  category: 'generators',
  categoryName: '生成',
  categoryIcon: '⚡',
  icon: '📱',
  description: '生成 QR 二维码，支持文本、URL、WiFi 配置等',
  render() {
    return `
      <div class="tool-card">
        <label>内容</label>
        <textarea id="qr-input" class="tool-textarea" placeholder="输入文本或 URL..." style="min-height:60px;"></textarea>
        <div class="inline-row" style="margin-top:12px;">
          <div>
            <label>容错级别</label>
            <select id="qr-ec" class="tool-select">
              <option value="L">L (低 7%)</option>
              <option value="M" selected>M (中 15%)</option>
              <option value="Q">Q (较高 25%)</option>
              <option value="H">H (高 30%)</option>
            </select>
          </div>
          <div>
            <label>尺寸</label>
            <select id="qr-size" class="tool-select">
              <option value="160">160</option>
              <option value="240" selected>240</option>
              <option value="360">360</option>
              <option value="480">480</option>
            </select>
          </div>
          <div style="display:flex;align-items:flex-end;gap:8px;">
            <button class="btn btn-primary" id="qr-generate">生成</button>
            <button class="btn btn-secondary" id="qr-download">下载 PNG</button>
          </div>
        </div>
      </div>
      <div class="tool-card" style="text-align:center;">
        <div id="qr-result">
          <canvas id="qr-canvas" style="display:none;border-radius:8px;"></canvas>
          <div id="qr-placeholder" style="padding:40px;color:var(--text-muted);font-size:14px;">
            点击「生成」按钮创建二维码
          </div>
        </div>
      </div>
    `;
  },
  async init(container) {
    const input = container.querySelector('#qr-input');
    const canvas = container.querySelector('#qr-canvas');
    const placeholder = container.querySelector('#qr-placeholder');
    const ecSelect = container.querySelector('#qr-ec');
    const sizeSelect = container.querySelector('#qr-size');

    const QRCode = await loadQRCodeLib();

    function generate() {
      const text = input.value.trim();
      if (!text) { showToast('请输入内容', 'error'); return; }

      try {
        canvas.width = 0;
        canvas.height = 0;
        canvas.style.display = 'inline-block';
        QRCode.toCanvas(canvas, text, {
          width: parseInt(sizeSelect.value),
          errorCorrectionLevel: ecSelect.value,
          margin: 4,
          color: { dark: '#000000', light: '#ffffff' },
        }, (err) => {
          if (err) canvas.style.display = 'none';
          if (err) {
            showToast('生成失败: ' + err.message, 'error');
            return;
          }
          canvas.style.display = 'inline-block';
          placeholder.style.display = 'none';
        });
      } catch (e) {
        showToast('生成失败: ' + e.message, 'error');
      }
    }

    container.querySelector('#qr-generate').addEventListener('click', generate);
    container.querySelector('#qr-download').addEventListener('click', () => {
      if (!canvas.width) { showToast('请先生成二维码', 'error'); return; }
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate();
    });
  }
};

async function loadQRCodeLib() {
  if (window.QRCodeLib) return window.QRCodeLib;
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.4/build/qrcode.min.js';
  document.head.appendChild(script);
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = () => reject(new Error('QR 库加载失败'));
  });
  window.QRCodeLib = { toCanvas: window.QRCode.toCanvas };
  return window.QRCodeLib;
}
