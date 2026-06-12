import { copyToClipboard } from '../app.js';

export default {
  id: 'html-entities',
  name: 'HTML 实体编解码',
  category: 'encoders',
  categoryName: '编解码',
  categoryIcon: '🔐',
  icon: '&lt;',
  description: 'HTML 实体编码与解码',
  render() {
    return `
      <div class="tool-card">
        <label>输入</label>
        <textarea id="html-input" class="tool-textarea" placeholder="输入要编码/解码的 HTML..."></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="html-encode">编码 &rarr;</button>
          <button class="btn btn-secondary" id="html-decode">解码 &rarr;</button>
          <button class="btn btn-secondary" id="html-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输出</label>
        <div class="output-area">
          <textarea id="html-output" class="tool-textarea" readonly placeholder="结果将显示在这里..."></textarea>
          <button class="copy-btn" id="html-copy">复制</button>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#html-input');
    const output = container.querySelector('#html-output');

    container.querySelector('#html-encode').addEventListener('click', () => {
      output.value = input.value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    });

    container.querySelector('#html-decode').addEventListener('click', () => {
      const ta = document.createElement('textarea');
      ta.innerHTML = input.value;
      output.value = ta.value;
    });

    container.querySelector('#html-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });

    container.querySelector('#html-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });
  }
};
