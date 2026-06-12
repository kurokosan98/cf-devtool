import { showToast } from '../app.js';

export default {
  id: 'jwt-decoder',
  name: 'JWT 解码器',
  category: 'encoders',
  categoryName: '编解码',
  categoryIcon: '🔐',
  icon: 'JWT',
  description: '解码 JSON Web Token，查看 Header 和 Payload（不验证签名）',
  render() {
    return `
      <div class="tool-card">
        <label>粘贴 JWT Token</label>
        <textarea id="jwt-input" class="tool-textarea" placeholder="粘贴 JWT token..." style="min-height:80px;"></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="jwt-decode">解码</button>
          <button class="btn btn-secondary" id="jwt-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <div class="jwt-section">
          <h4>Header</h4>
          <div class="jwt-json" id="jwt-header">-</div>
        </div>
        <div class="jwt-section">
          <h4>Payload</h4>
          <div class="jwt-json" id="jwt-payload">-</div>
        </div>
        <div class="jwt-section">
          <h4>签名</h4>
          <div style="font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);word-break:break-all;" id="jwt-signature">-</div>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#jwt-input');
    const headerEl = container.querySelector('#jwt-header');
    const payloadEl = container.querySelector('#jwt-payload');
    const sigEl = container.querySelector('#jwt-signature');

    function decode() {
      const token = input.value.trim();
      if (!token) { showToast('请输入 JWT token', 'error'); return; }
      const parts = token.split('.');
      if (parts.length !== 3) {
        headerEl.textContent = '❌ 无效的 JWT 格式';
        payloadEl.textContent = '❌';
        sigEl.textContent = '❌';
        return;
      }
      try {
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        headerEl.textContent = JSON.stringify(header, null, 2);
        payloadEl.textContent = JSON.stringify(payload, null, 2);
        sigEl.textContent = parts[2];
      } catch (e) {
        headerEl.textContent = `❌ 解码失败: ${e.message}`;
        payloadEl.textContent = '❌';
        sigEl.textContent = '❌';
      }
    }

    container.querySelector('#jwt-decode').addEventListener('click', decode);

    container.querySelector('#jwt-clear').addEventListener('click', () => {
      input.value = '';
      headerEl.textContent = '-';
      payloadEl.textContent = '-';
      sigEl.textContent = '-';
    });
  }
};
