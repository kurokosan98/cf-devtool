import { copyToClipboard } from '../app.js';

export default {
  id: 'timestamp',
  name: '时间戳转换',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '🔄',
  icon: '⏱',
  description: 'Unix 时间戳与日期时间互相转换',
  render() {
    return `
      <div class="tool-card">
        <label>当前时间</label>
        <div class="ts-grid">
          <div class="ts-item">
            <label>Unix 时间戳（秒）</label>
            <div class="ts-value" id="ts-now-seconds"></div>
          </div>
          <div class="ts-item">
            <label>Unix 时间戳（毫秒）</label>
            <div class="ts-value" id="ts-now-millis"></div>
          </div>
          <div class="ts-item" style="grid-column: 1 / -1;">
            <label>可读日期（UTC）</label>
            <div class="ts-value" id="ts-now-utc"></div>
          </div>
          <div class="ts-item" style="grid-column: 1 / -1;">
            <label>可读日期（本地）</label>
            <div class="ts-value" id="ts-now-local"></div>
          </div>
        </div>
      </div>
      <div class="tool-card">
        <label>时间戳 &rarr; 日期</label>
        <div class="inline-row">
          <input type="number" id="ts-to-date-input" class="tool-input" placeholder="输入时间戳（秒或毫秒）">
          <button class="btn btn-primary" id="ts-to-date-btn">转换 &darr;</button>
        </div>
        <div id="ts-to-date-result" style="margin-top:8px;font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);"></div>
      </div>
      <div class="tool-card">
        <label>日期 &rarr; 时间戳</label>
        <div class="inline-row">
          <input type="datetime-local" id="ts-from-date-input" class="tool-input">
          <button class="btn btn-primary" id="ts-from-date-btn">转换 &darr;</button>
        </div>
        <div id="ts-from-date-result" style="margin-top:8px;font-family:var(--font-mono);font-size:13px;color:var(--text-secondary);"></div>
      </div>
    `;
  },
  init(container) {
    function updateNow() {
      const now = Date.now();
      container.querySelector('#ts-now-seconds').textContent = Math.floor(now / 1000);
      container.querySelector('#ts-now-millis').textContent = now;
      container.querySelector('#ts-now-utc').textContent = new Date().toUTCString();
      container.querySelector('#ts-now-local').textContent = new Date().toString();
    }
    updateNow();
    setInterval(updateNow, 1000);

    container.querySelector('#ts-to-date-btn').addEventListener('click', () => {
      const input = container.querySelector('#ts-to-date-input').value.trim();
      const result = container.querySelector('#ts-to-date-result');
      if (!input) { result.textContent = '请输入时间戳'; return; }
      let ts = Number(input);
      if (isNaN(ts)) { result.textContent = '❌ 无效的时间戳'; return; }
      if (ts < 1e12) ts *= 1000;
      const d = new Date(ts);
      if (d.toString() === 'Invalid Date') { result.textContent = '❌ 无效的时间戳'; return; }
      result.innerHTML = `${d.toString()}<br>${d.toUTCString()}`;
    });

    container.querySelector('#ts-from-date-btn').addEventListener('click', () => {
      const input = container.querySelector('#ts-from-date-input').value;
      const result = container.querySelector('#ts-from-date-result');
      if (!input) { result.textContent = '请选择日期时间'; return; }
      const d = new Date(input);
      result.innerHTML = `秒: ${Math.floor(d.getTime() / 1000)}<br>毫秒: ${d.getTime()}`;
    });
  }
};
