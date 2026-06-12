import { showToast, copyToClipboard } from '../app.js';

export default {
  id: 'json-formatter',
  name: 'JSON 格式化',
  category: 'formatters',
  categoryName: '格式化',
  categoryIcon: '📝',
  icon: '📋',
  description: '格式化、验证和压缩 JSON 数据',
  render() {
    return `
      <div class="tool-card">
        <label>输入 JSON</label>
        <textarea id="jf-input" class="tool-textarea" placeholder="粘贴 JSON 数据..."></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="jf-format">格式化</button>
          <button class="btn btn-secondary" id="jf-compress">压缩</button>
          <button class="btn btn-secondary" id="jf-validate">验证</button>
          <button class="btn btn-secondary" id="jf-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输出</label>
        <div class="output-area">
          <textarea id="jf-output" class="tool-textarea" readonly placeholder="结果将显示在这里..."></textarea>
          <button class="copy-btn" id="jf-copy">复制</button>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#jf-input');
    const output = container.querySelector('#jf-output');

    container.querySelector('#jf-format').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(input.value);
        output.value = JSON.stringify(parsed, null, 2);
      } catch (e) {
        output.value = `❌ JSON 解析错误: ${e.message}`;
      }
    });

    container.querySelector('#jf-compress').addEventListener('click', () => {
      try {
        const parsed = JSON.parse(input.value);
        output.value = JSON.stringify(parsed);
      } catch (e) {
        output.value = `❌ JSON 解析错误: ${e.message}`;
      }
    });

    container.querySelector('#jf-validate').addEventListener('click', () => {
      try {
        JSON.parse(input.value);
        showToast('✅ 有效的 JSON', 'success');
      } catch (e) {
        showToast(`❌ ${e.message}`, 'error');
      }
    });

    container.querySelector('#jf-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#jf-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });
  }
};
