import { copyToClipboard } from '../app.js';

export default {
  id: 'case-converter',
  name: '大小写转换',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '🔄',
  icon: 'Aa',
  description: '文本大小写格式互转：驼峰、蛇形、连字符等',
  render() {
    return `
      <div class="tool-card">
        <label>输入文本</label>
        <textarea id="cc-input" class="tool-textarea" placeholder="输入要转换的文本..."></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="cc-convert">转换</button>
          <button class="btn btn-secondary" id="cc-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输出格式</label>
        <div class="case-output-grid" id="cc-output">
          <div class="case-row"><span class="case-label">camelCase</span><span class="case-value" id="cc-camel">-</span><button class="case-copy" data-target="cc-camel" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">PascalCase</span><span class="case-value" id="cc-pascal">-</span><button class="case-copy" data-target="cc-pascal" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">snake_case</span><span class="case-value" id="cc-snake">-</span><button class="case-copy" data-target="cc-snake" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">SCREAMING_SNAKE</span><span class="case-value" id="cc-screaming">-</span><button class="case-copy" data-target="cc-screaming" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">kebab-case</span><span class="case-value" id="cc-kebab">-</span><button class="case-copy" data-target="cc-kebab" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">Train-Case</span><span class="case-value" id="cc-train">-</span><button class="case-copy" data-target="cc-train" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">lowercase</span><span class="case-value" id="cc-lower">-</span><button class="case-copy" data-target="cc-lower" title="复制">📋</button></div>
          <div class="case-row"><span class="case-label">UPPERCASE</span><span class="case-value" id="cc-upper">-</span><button class="case-copy" data-target="cc-upper" title="复制">📋</button></div>
          <div class="case-row" style="grid-column:1/-1;"><span class="case-label">Capitalized</span><span class="case-value" id="cc-capitalized">-</span><button class="case-copy" data-target="cc-capitalized" title="复制">📋</button></div>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#cc-input');

    function convert() {
      const text = input.value.trim();
      if (!text) return;
      const words = text.split(/[\s_-]+|(?=[A-Z])/).filter(Boolean).map(w => w.toLowerCase());

      const results = {
        'cc-camel': words.map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(''),
        'cc-pascal': words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
        'cc-snake': words.join('_'),
        'cc-screaming': words.join('_').toUpperCase(),
        'cc-kebab': words.join('-'),
        'cc-train': words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-'),
        'cc-lower': text.toLowerCase(),
        'cc-upper': text.toUpperCase(),
        'cc-capitalized': text.replace(/\b\w/g, c => c.toUpperCase()),
      };

      for (const [id, val] of Object.entries(results)) {
        container.querySelector(`#${id}`).textContent = val;
      }
    }

    container.querySelector('#cc-convert').addEventListener('click', convert);

    container.querySelector('#cc-clear').addEventListener('click', () => {
      input.value = '';
      container.querySelectorAll('.case-value').forEach(el => el.textContent = '-');
    });

    container.querySelectorAll('.case-copy').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = container.querySelector(`#${btn.dataset.target}`).textContent;
        if (val && val !== '-') copyToClipboard(val, '已复制');
      });
    });
  }
};
