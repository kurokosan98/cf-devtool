export default {
  id: 'regex-tester',
  name: '正则测试',
  category: 'testers',
  categoryName: '测试',
  categoryIcon: '🧪',
  icon: '.*',
  description: '测试正则表达式匹配，实时高亮匹配结果',
  render() {
    return `
      <div class="tool-card">
        <label>正则表达式</label>
        <input type="text" id="regex-pattern" class="tool-input" placeholder="例如: \\d+">
        <div class="regex-flags">
          <label><input type="checkbox" id="regex-flag-g" checked> g (全局)</label>
          <label><input type="checkbox" id="regex-flag-i"> i (忽略大小写)</label>
          <label><input type="checkbox" id="regex-flag-m"> m (多行)</label>
          <label><input type="checkbox" id="regex-flag-s"> s (. 匹配换行)</label>
        </div>
      </div>
      <div class="tool-card">
        <label>测试文本</label>
        <textarea id="regex-input" class="tool-textarea" placeholder="输入要匹配的文本..." style="min-height:150px;"></textarea>
      </div>
      <div class="tool-card">
        <label>匹配结果</label>
        <div class="match-info" id="regex-info" style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;"></div>
        <div class="regex-matches" id="regex-output">等待输入...</div>
      </div>
    `;
  },
  init(container) {
    const pattern = container.querySelector('#regex-pattern');
    const input = container.querySelector('#regex-input');
    const output = container.querySelector('#regex-output');
    const info = container.querySelector('#regex-info');
    const flagG = container.querySelector('#regex-flag-g');
    const flagI = container.querySelector('#regex-flag-i');
    const flagM = container.querySelector('#regex-flag-m');
    const flagS = container.querySelector('#regex-flag-s');

    function update() {
      const text = input.value;
      const pat = pattern.value;
      if (!pat || !text) {
        output.textContent = pat ? '请输入测试文本' : '请输入正则表达式';
        info.textContent = '';
        return;
      }
      try {
        let flags = '';
        if (flagG.checked) flags += 'g';
        if (flagI.checked) flags += 'i';
        if (flagM.checked) flags += 'm';
        if (flagS.checked) flags += 's';
        const regex = new RegExp(pat, flags);

        const matches = [...text.matchAll(regex)];
        if (matches.length === 0) {
          output.textContent = '无匹配结果';
          info.textContent = '0 个匹配';
          return;
        }

        let lastIndex = 0;
        let html = '';
        let count = 0;
        for (const m of matches) {
          if (m.index > lastIndex) {
            html += escapeHtml(text.slice(lastIndex, m.index));
          }
          html += `<span class="regex-match-highlight">${escapeHtml(m[0])}</span>`;
          lastIndex = m.index + m[0].length;
          count++;
        }
        if (lastIndex < text.length) {
          html += escapeHtml(text.slice(lastIndex));
        }
        output.innerHTML = html;
        info.textContent = `${count} 个匹配`;
      } catch (e) {
        output.textContent = `❌ 正则错误: ${e.message}`;
        info.textContent = '';
      }
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    let debounce;
    function scheduleUpdate() {
      clearTimeout(debounce);
      debounce = setTimeout(update, 200);
    }

    pattern.addEventListener('input', scheduleUpdate);
    input.addEventListener('input', scheduleUpdate);
    flagG.addEventListener('change', update);
    flagI.addEventListener('change', update);
    flagM.addEventListener('change', update);
    flagS.addEventListener('change', update);
  }
};
