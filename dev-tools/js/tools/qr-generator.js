import QR from '../lib/qrcode.js';
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
            <label>尺寸 (px)</label>
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
      <div class="tool-card" id="qr-info-card" style="display:none;">
        <div style="display:flex;gap:16px;font-size:13px;color:var(--text-secondary);flex-wrap:wrap;">
          <span id="qr-ver-info"></span>
          <span id="qr-size-info"></span>
          <span id="qr-ec-info"></span>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#qr-input');
    const canvas = container.querySelector('#qr-canvas');
    const placeholder = container.querySelector('#qr-placeholder');
    const ecSelect = container.querySelector('#qr-ec');
    const sizeSelect = container.querySelector('#qr-size');
    const infoCard = container.querySelector('#qr-info-card');
    const verInfo = container.querySelector('#qr-ver-info');
    const sizeInfo = container.querySelector('#qr-size-info');
    const ecInfo = container.querySelector('#qr-ec-info');

    const inputDisplay = container.querySelector('#qr-input-display');

    function generate() {
      const text = input.value.trim();
      if (!text) { showToast('请输入内容', 'error'); return; }

      const ecLevel = ecSelect.value;
      const pixelSize = parseInt(sizeSelect.value);

      const result = QR.generate(text, ecLevel);
      if (!result) {
        showToast('内容太长，请缩短文本', 'error');
        return;
      }

      const { matrix, version, size } = result;
      const moduleSize = Math.floor(pixelSize / size);
      const actualSize = moduleSize * size;
      const offset = Math.floor((pixelSize - actualSize) / 2);

      canvas.width = pixelSize;
      canvas.height = pixelSize;
      canvas.style.display = 'inline-block';
      placeholder.style.display = 'none';

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pixelSize, pixelSize);

      ctx.fillStyle = '#000000';
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (matrix[r][c]) {
            ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize, moduleSize);
          }
        }
      }

      infoCard.style.display = 'block';
      verInfo.textContent = `版本: ${version}`;
      sizeInfo.textContent = `矩阵: ${size}×${size}`;
      ecInfo.textContent = `容错: ${ecLevel}`;
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
