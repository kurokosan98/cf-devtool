export default {
  id: 'diff-checker',
  name: '文本对比',
  category: 'testers',
  categoryName: '测试',
  categoryIcon: '🧪',
  icon: '≠',
  description: '对比两段文本的差异',
  render() {
    return `
      <div class="tool-card">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label>原始文本</label>
            <textarea id="diff-left" class="tool-textarea" placeholder="原始文本..." style="min-height:150px;"></textarea>
          </div>
          <div>
            <label>新文本</label>
            <textarea id="diff-right" class="tool-textarea" placeholder="新文本..." style="min-height:150px;"></textarea>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" id="diff-compare">比较</button>
          <button class="btn btn-secondary" id="diff-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>差异结果</label>
        <div class="diff-output" id="diff-output">等待比较...</div>
      </div>
    `;
  },
  init(container) {
    const left = container.querySelector('#diff-left');
    const right = container.querySelector('#diff-right');
    const output = container.querySelector('#diff-output');

    function diff(a, b) {
      const alines = a.split('\n');
      const blines = b.split('\n');
      const m = alines.length, n = blines.length;
      const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (alines[i - 1] === blines[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }
      const result = [];
      let i = m, j = n;
      const temp = [];
      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && alines[i - 1] === blines[j - 1]) {
          temp.push({ type: 'same', line: alines[i - 1] });
          i--; j--;
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          temp.push({ type: 'add', line: blines[j - 1] });
          j--;
        } else {
          temp.push({ type: 'remove', line: alines[i - 1] });
          i--;
        }
      }
      return temp.reverse();
    }

    function compare() {
      const a = left.value;
      const b = right.value;
      if (!a && !b) { output.textContent = '请输入文本'; return; }
      const result = diff(a, b);
      let html = '';
      for (const r of result) {
        const cls = r.type === 'add' ? 'diff-add' : r.type === 'remove' ? 'diff-remove' : '';
        const prefix = r.type === 'add' ? '+ ' : r.type === 'remove' ? '- ' : '  ';
        html += `<div class="${cls}">${escapeHtml(prefix + r.line)}</div>`;
      }
      output.innerHTML = html || '<span style="color:var(--text-muted)">两段文本完全相同</span>';
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    container.querySelector('#diff-compare').addEventListener('click', compare);

    container.querySelector('#diff-clear').addEventListener('click', () => {
      left.value = '';
      right.value = '';
      output.textContent = '等待比较...';
    });
  }
};
