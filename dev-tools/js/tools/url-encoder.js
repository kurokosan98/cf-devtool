import { copyToClipboard } from '../app.js';

export default {
  id: 'url-encoder',
  name: 'URL 编解码',
  category: 'encoders',
  categoryName: '编解码',
  categoryIcon: '🔐',
  icon: '🔗',
  description: 'URL 编码与解码',
  render() {
    return `
      <div class="tool-card">
        <label>输入</label>
        <textarea id="url-input" class="tool-textarea" placeholder="输入要编码/解码的 URL..."></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="url-encode">编码 &rarr;</button>
          <button class="btn btn-secondary" id="url-decode">解码 &rarr;</button>
          <button class="btn btn-secondary" id="url-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输出</label>
        <div class="output-area">
          <textarea id="url-output" class="tool-textarea" readonly placeholder="结果将显示在这里..."></textarea>
          <button class="copy-btn" id="url-copy">复制</button>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#url-input');
    const output = container.querySelector('#url-output');

    container.querySelector('#url-encode').addEventListener('click', () => {
      try {
        output.value = encodeURIComponent(input.value);
      } catch (e) {
        output.value = `❌ 编码错误: ${e.message}`;
      }
    });

    container.querySelector('#url-decode').addEventListener('click', () => {
      try {
        output.value = decodeURIComponent(input.value);
      } catch (e) {
        output.value = `❌ 解码错误: ${e.message}`;
      }
    });

    container.querySelector('#url-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#url-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });
  }
};
