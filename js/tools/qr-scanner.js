import { showToast } from '../app.js';

export default {
  id: 'qr-scanner',
  name: '二维码扫码',
  category: 'testers',
  categoryName: '测试',
  categoryIcon: '🧪',
  icon: '📱',
  description: '使用摄像头扫描和解码 QR 二维码',
  render() {
    return `
      <div class="tool-card">
        <div class="scanner-container" style="text-align:center;">
          <div class="scanner-view" style="position:relative;">
            <video id="scanner-video" autoplay playsinline style="max-width:100%;border-radius:var(--radius);background:#000;display:block;"></video>
            <canvas id="scanner-canvas" style="display:none;max-width:100%;border-radius:var(--radius);background:#000;"></canvas>
          </div>
          <div id="scanner-status" style="padding:16px;color:var(--text-muted);font-size:14px;">
            点击下方按钮启动摄像头
          </div>
          <div class="btn-row" style="justify-content:center;">
            <button class="btn btn-primary" id="scanner-start">启动摄像头</button>
            <button class="btn btn-secondary" id="scanner-stop" disabled>停止</button>
            <button class="btn btn-success" id="scanner-rescan" style="display:none;">继续扫描</button>
          </div>
        </div>
      </div>
      <div class="tool-card" id="scanner-result-card" style="display:none;">
        <label>扫码结果</label>
        <div class="output-area">
          <textarea id="scanner-result" class="tool-textarea copy-target" readonly style="min-height:60px;"></textarea>
          <button class="copy-btn" id="scanner-copy">复制</button>
        </div>
      </div>
      <div class="tool-card" id="scanner-picker-card" style="display:none;">
        <label>选择要识别的二维码</label>
        <div id="scanner-picker-list"></div>
      </div>
    `;
  },
  async init(container) {
    const video = container.querySelector('#scanner-video');
    const canvas = container.querySelector('#scanner-canvas');
    const status = container.querySelector('#scanner-status');
    const startBtn = container.querySelector('#scanner-start');
    const stopBtn = container.querySelector('#scanner-stop');
    const rescanBtn = container.querySelector('#scanner-rescan');
    const resultCard = container.querySelector('#scanner-result-card');
    const resultText = container.querySelector('#scanner-result');
    const copyBtn = container.querySelector('#scanner-copy');
    const pickerCard = container.querySelector('#scanner-picker-card');
    const pickerList = container.querySelector('#scanner-picker-list');

    let stream = null;
    let animFrame = null;
    let jsQR = null;
    let foundCodes = [];

    try {
      jsQR = await loadJsqr();
    } catch (e) {
      status.textContent = '扫码库加载失败: ' + e.message;
      return;
    }

    function findAllCodes(imageData, w, h) {
      const codes = [];
      const data = new Uint8ClampedArray(imageData.data);
      for (let i = 0; i < 10; i++) {
        const code = jsQR(data, w, h, { inversionAttempts: 'dontInvert' });
        if (!code) break;
        codes.push(code);
        const loc = code.location;
        const xs = [loc.topLeftCorner.x, loc.topRightCorner.x, loc.bottomRightCorner.x, loc.bottomLeftCorner.x];
        const ys = [loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomRightCorner.y, loc.bottomLeftCorner.y];
        const minX = Math.max(0, Math.floor(Math.min(...xs)) - 4);
        const minY = Math.max(0, Math.floor(Math.min(...ys)) - 4);
        const maxX = Math.min(w, Math.ceil(Math.max(...xs)) + 4);
        const maxY = Math.min(h, Math.ceil(Math.max(...ys)) + 4);
        for (let y = minY; y < maxY; y++) {
          for (let x = minX; x < maxX; x++) {
            const idx = (y * w + x) * 4;
            data[idx] = data[idx + 1] = data[idx + 2] = 255;
          }
        }
      }
      return codes;
    }

    function drawBoundingBox(ctx, corners, index, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(corners[0].x, corners[0].y);
      for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = color + '30';
      ctx.fill();
      const cx = corners.reduce((s, p) => s + p.x, 0) / 4;
      const cy = corners.reduce((s, p) => s + p.y, 0) / 4;
      ctx.fillStyle = color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(String(index + 1), cx, cy - 4);
    }

    function freezeFrameMulti(ctx, w, h, codes) {
      video.style.display = 'none';
      canvas.style.display = 'block';
      ctx.drawImage(video, 0, 0, w, h);
      const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#34d399', '#f472b6', '#f97316', '#06b6d4', '#e879f9'];
      codes.forEach((code, i) => {
        const loc = code.location;
        const corners = [loc.topLeftCorner, loc.topRightCorner, loc.bottomRightCorner, loc.bottomLeftCorner];
        drawBoundingBox(ctx, corners, i, colors[i % colors.length]);
      });
    }

    function showPicker(codes) {
      pickerList.innerHTML = codes.map((code, i) => {
        const colors = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#a78bfa', '#34d399', '#f472b6', '#f97316', '#06b6d4', '#e879f9'];
        const preview = code.data.length > 60 ? code.data.slice(0, 60) + '...' : code.data;
        return `<div class="picker-item" style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer;" data-index="${i}">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${colors[i % colors.length]};color:#000;font-size:13px;font-weight:700;flex-shrink:0;">${i + 1}</span>
          <span style="flex:1;font-family:var(--font-mono);font-size:13px;word-break:break-all;color:var(--text-primary);">${escapeHtml(preview)}</span>
          <button class="btn btn-sm btn-primary picker-select" data-index="${i}">选择</button>
        </div>`;
      }).join('');
      pickerCard.style.display = '';
      pickerList.querySelectorAll('.picker-select').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          selectCode(parseInt(btn.dataset.index));
        });
      });
      pickerList.querySelectorAll('.picker-item').forEach(item => {
        item.addEventListener('click', () => selectCode(parseInt(item.dataset.index)));
      });
    }

    function selectCode(index) {
      const code = foundCodes[index];
      if (!code) return;
      resultText.value = code.data;
      resultCard.style.display = '';
      pickerCard.style.display = 'none';
      status.innerHTML = `<span style="color:var(--success);">&#x2713; 扫码成功！</span>`;
      rescanBtn.style.display = '';
    }

    function processFrame() {
      if (!video.videoWidth) { animFrame = requestAnimationFrame(processFrame); return; }
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w === 0 || h === 0) { animFrame = requestAnimationFrame(processFrame); return; }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      foundCodes = findAllCodes(imageData, w, h);
      if (foundCodes.length > 0) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
        freezeFrameMulti(ctx, w, h, foundCodes);
        if (foundCodes.length === 1) {
          selectCode(0);
        } else {
          status.textContent = `发现 ${foundCodes.length} 个二维码，请选择要识别的`;
          showPicker(foundCodes);
        }
        return;
      }
      animFrame = requestAnimationFrame(processFrame);
    }

    async function startCamera() {
      rescanBtn.style.display = 'none';
      resultCard.style.display = 'none';
      pickerCard.style.display = 'none';
      video.style.display = 'block';
      canvas.style.display = 'none';
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        video.srcObject = stream;
        await video.play();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        status.textContent = '正在扫描... 将二维码对准摄像头';
        animFrame = requestAnimationFrame(processFrame);
      } catch (e) {
        status.textContent = '摄像头启动失败: ' + e.message;
        if (e.name === 'NotAllowedError') {
          status.textContent = '摄像头权限被拒绝，请在浏览器设置中允许摄像头访问';
        }
      }
    }

    function stopCamera() {
      if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
      }
      video.srcObject = null;
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }

    startBtn.addEventListener('click', startCamera);
    stopBtn.addEventListener('click', () => { stopCamera(); status.textContent = '已停止扫描'; });
    rescanBtn.addEventListener('click', () => {
      resultCard.style.display = 'none';
      pickerCard.style.display = 'none';
      status.textContent = '正在扫描... 将二维码对准摄像头';
      startCamera();
    });

    copyBtn.addEventListener('click', async () => {
      if (resultText.value) {
        try {
          await navigator.clipboard.writeText(resultText.value);
          showToast('已复制');
        } catch {
          resultText.select();
          document.execCommand('copy');
          showToast('已复制');
        }
      }
    });

    container.querySelector('#scanner-result').addEventListener('click', function() {
      this.select();
    });
  }
};

async function loadJsqr() {
  if (window.jsQR) return window.jsQR;
  const script = document.createElement('script');
  script.src = 'js/lib/jsqr.js';
  document.head.appendChild(script);
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = () => reject(new Error('jsQR 库加载失败'));
  });
  return window.jsQR;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}
