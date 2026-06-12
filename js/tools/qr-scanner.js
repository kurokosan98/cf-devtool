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
          <div class="scanner-view">
            <video id="scanner-video" autoplay playsinline style="max-width:100%;border-radius:var(--radius);background:#000;"></video>
            <canvas id="scanner-canvas" style="display:none;"></canvas>
          </div>
          <div id="scanner-status" style="padding:16px;color:var(--text-muted);font-size:14px;">
            点击下方按钮启动摄像头
          </div>
          <div class="btn-row" style="justify-content:center;">
            <button class="btn btn-primary" id="scanner-start">启动摄像头</button>
            <button class="btn btn-secondary" id="scanner-stop" disabled>停止</button>
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
    `;
  },
  async init(container) {
    const video = container.querySelector('#scanner-video');
    const canvas = container.querySelector('#scanner-canvas');
    const status = container.querySelector('#scanner-status');
    const startBtn = container.querySelector('#scanner-start');
    const stopBtn = container.querySelector('#scanner-stop');
    const resultCard = container.querySelector('#scanner-result-card');
    const resultText = container.querySelector('#scanner-result');
    const copyBtn = container.querySelector('#scanner-copy');

    let stream = null;
    let animFrame = null;
    let jsQR = null;

    try {
      jsQR = await loadJsqr();
    } catch (e) {
      status.textContent = '扫码库加载失败: ' + e.message;
      return;
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
      const code = jsQR(imageData.data, w, h, { inversionAttempts: 'dontInvert' });
      if (code) {
        resultText.value = code.data;
        resultCard.style.display = '';
        status.innerHTML = `<span style="color:var(--success);">&#x2713; 扫码成功！</span>`;
        stopCamera();
        return;
      }
      animFrame = requestAnimationFrame(processFrame);
    }

    async function startCamera() {
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
