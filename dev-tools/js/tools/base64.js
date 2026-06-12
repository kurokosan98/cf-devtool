import { showToast, copyToClipboard } from '../app.js';

export default {
  id: 'base64',
  name: 'Base64 编解码',
  category: 'encoders',
  categoryName: '编解码',
  categoryIcon: '🔐',
  icon: 'B64',
  description: 'Base64 编码与解码，支持文本和文件',
  render() {
    return `
      <div class="tool-card">
        <label>输入文本</label>
        <textarea id="b64-input" class="tool-textarea" placeholder="输入要编码/解码的文本..."></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="b64-encode">编码 &rarr;</button>
          <button class="btn btn-secondary" id="b64-decode">解码 &rarr;</button>
          <button class="btn btn-secondary" id="b64-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输出</label>
        <div class="output-area">
          <textarea id="b64-output" class="tool-textarea" readonly placeholder="结果将显示在这里..."></textarea>
          <button class="copy-btn" id="b64-copy">复制</button>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#b64-input');
    const output = container.querySelector('#b64-output');

    container.querySelector('#b64-encode').addEventListener('click', () => {
      try {
        output.value = btoa(unescape(encodeURIComponent(input.value)));
      } catch (e) {
        output.value = `❌ 编码错误: ${e.message}`;
      }
    });

    container.querySelector('#b64-decode').addEventListener('click', () => {
      try {
        output.value = decodeURIComponent(escape(atob(input.value.trim())));
      } catch (e) {
        output.value = `❌ 解码错误: ${e.message}`;
      }
    });

    container.querySelector('#b64-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#b64-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });
  }
};
