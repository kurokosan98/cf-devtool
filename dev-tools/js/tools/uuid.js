import { showToast, copyToClipboard } from '../app.js';

export default {
  id: 'uuid',
  name: 'UUID 生成器',
  category: 'generators',
  categoryName: '生成',
  categoryIcon: '⚡',
  icon: '🆔',
  description: '生成 UUID v4，支持批量生成',
  render() {
    return `
      <div class="tool-card">
        <div class="inline-row">
          <label style="flex:0 0 auto;">生成数量</label>
          <input type="number" id="uuid-count" class="tool-input" value="1" min="1" max="100" style="width:80px;">
          <button class="btn btn-primary" id="uuid-generate">生成</button>
          <button class="btn btn-secondary" id="uuid-copy-all">复制全部</button>
        </div>
      </div>
      <div class="tool-card">
        <div class="uuid-list" id="uuid-list"></div>
      </div>
    `;
  },
  init(container) {
    const listEl = container.querySelector('#uuid-list');
    const countInput = container.querySelector('#uuid-count');

    function generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    }

    function renderUUIDs() {
      const count = Math.min(Math.max(parseInt(countInput.value) || 1, 1), 100);
      let html = '';
      for (let i = 0; i < count; i++) {
        const uuid = generateUUID();
        html += `<div class="uuid-row">
          <span class="uuid-value">${uuid}</span>
          <button class="uuid-copy" data-uuid="${uuid}" title="复制">📋</button>
        </div>`;
      }
      listEl.innerHTML = html;
      listEl.querySelectorAll('.uuid-copy').forEach(btn => {
        btn.addEventListener('click', () => copyToClipboard(btn.dataset.uuid, '已复制 UUID'));
      });
    }

    container.querySelector('#uuid-generate').addEventListener('click', renderUUIDs);
    container.querySelector('#uuid-copy-all').addEventListener('click', () => {
      const uuids = [...listEl.querySelectorAll('.uuid-value')].map(el => el.textContent).join('\n');
      if (uuids) copyToClipboard(uuids, '已复制全部');
    });

    renderUUIDs();
  }
};
