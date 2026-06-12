export default {
  id: 'markdown-preview',
  name: 'Markdown 预览',
  category: 'formatters',
  categoryName: '格式化',
  categoryIcon: '📝',
  icon: '📝',
  description: '实时 Markdown 编辑与预览，支持 GFM 语法',
  render() {
    return `
      <div class="tool-card">
        <div class="md-toolbar">
          <button class="btn btn-primary btn-sm" id="md-insert-heading">H</button>
          <button class="btn btn-secondary btn-sm" id="md-insert-bold"><b>B</b></button>
          <button class="btn btn-secondary btn-sm" id="md-insert-italic"><i>I</i></button>
          <button class="btn btn-secondary btn-sm" id="md-insert-code">&lt;/&gt;</button>
          <button class="btn btn-secondary btn-sm" id="md-insert-link">🔗</button>
          <button class="btn btn-secondary btn-sm" id="md-insert-list">•</button>
          <button class="btn btn-secondary btn-sm" id="md-insert-table">⊞</button>
          <span style="flex:1"></span>
          <button class="btn btn-secondary btn-sm" id="md-clear">清空</button>
        </div>
      </div>
      <div class="md-split">
        <div class="md-pane">
          <label>Markdown</label>
          <textarea id="md-input" class="tool-textarea" placeholder="输入 Markdown..." style="min-height:400px;font-family:var(--font-mono);"></textarea>
        </div>
        <div class="md-pane">
          <label>预览</label>
          <div id="md-preview" class="md-preview"></div>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#md-input');
    const preview = container.querySelector('#md-preview');

    function renderMarkdown(src) {
      let html = src;

      html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      const escapeHtml = (t) => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

      const lines = html.split('\n');
      let inCodeBlock = false;
      let codeLang = '';
      const codeLines = [];
      const result = [];
      let inTable = false;
      let tableHtml = '';
      let tableAlign = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('&lt;!--')) {
          while (i < lines.length && !lines[i].includes('--&gt;')) i++;
          continue;
        }

        const codeMatch = line.match(/^```(\w*)/);
        if (codeMatch) {
          if (inCodeBlock) {
            const code = escapeHtml(codeLines.join('\n'));
            const lang = codeLang ? ` class="lang-${codeLang}"` : '';
            result.push(`<pre${lang}><code>${code}</code></pre>`);
            codeLines.length = 0;
            inCodeBlock = false;
            codeLang = '';
          } else {
            inCodeBlock = true;
            codeLang = codeMatch[1];
          }
          continue;
        }
        if (inCodeBlock) {
          codeLines.push(line);
          continue;
        }

        if (line.trim() === '') {
          if (inTable) {
            inTable = false;
            result.push(tableHtml);
            tableHtml = '';
          }
          result.push('');
          continue;
        }

        const tableSepMatch = line.match(/^\|?[\s:-]+\|[\s:-]+\|/);
        if (tableSepMatch && !inTable) {
          const cols = line.split('|').filter(c => c.trim());
          tableAlign = cols.map(c => {
            if (c.startsWith(':') && c.endsWith(':')) return ' style="text-align:center"';
            if (c.endsWith(':')) return ' style="text-align:right"';
            return '';
          });
          continue;
        }

        const tableRowMatch = line.match(/^\|(.+)\|/);
        if (tableRowMatch) {
          if (!inTable) {
            inTable = true;
            tableHtml = '<table><thead><tr>';
          }
          const cols = line.split('|').slice(1, -1);
          const tag = inTable && tableHtml.includes('<thead>') ? 'th' : 'td';
          let rowHtml = '<tr>';
          cols.forEach((c, idx) => {
            const align = tableAlign[idx] || '';
            rowHtml += `<${tag}${align}>${inlineRender(c.trim())}</${tag}>`;
          });
          rowHtml += '</tr>';
          if (inTable && tableHtml.includes('<thead>')) {
            tableHtml += rowHtml + '</thead><tbody>';
          } else {
            tableHtml += rowHtml;
          }
          continue;
        }
        if (inTable) {
          inTable = false;
          tableHtml += '</tbody></table>';
          result.push(tableHtml);
          tableHtml = '';
        }

        const hrMatch = line.match(/^(-{3,}|\*{3,}|_{3,})$/);
        if (hrMatch) { result.push('<hr>'); continue; }

        const blockquoteMatch = line.match(/^>\s?(.*)/);
        if (blockquoteMatch) {
          result.push(`<blockquote>${inlineRender(blockquoteMatch[1])}</blockquote>`);
          continue;
        }

        const headerMatch = line.match(/^(#{1,6})\s+(.+)/);
        if (headerMatch) {
          const level = headerMatch[1].length;
          result.push(`<h${level}>${inlineRender(headerMatch[2])}</h${level}>`);
          continue;
        }

        const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)/);
        if (ulMatch) {
          const indent = Math.floor(ulMatch[1].length / 2);
          result.push(`${'  '.repeat(indent)}<li>${inlineRender(ulMatch[2])}</li>`);
          continue;
        }

        const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
        if (olMatch) {
          const indent = Math.floor(olMatch[1].length / 2);
          result.push(`${'  '.repeat(indent)}<li type="1">${inlineRender(olMatch[2])}</li>`);
          continue;
        }

        result.push(`<p>${inlineRender(line)}</p>`);
      }

      if (inCodeBlock) {
        const code = escapeHtml(codeLines.join('\n'));
        result.push(`<pre><code>${code}</code></pre>`);
      }
      if (inTable) {
        tableHtml += '</tbody></table>';
        result.push(tableHtml);
      }

      let finalHtml = result.join('\n');

      finalHtml = finalHtml.replace(/(<li>.*?<\/li>\n?)+/g, (match) => {
        if (match.includes('type="1"')) {
          return '<ol>' + match.replace(/ type="1"/g, '') + '</ol>';
        }
        return '<ul>' + match + '</ul>';
      });

      finalHtml = finalHtml.replace(/<\/blockquote>\n<blockquote>/g, '\n');

      return finalHtml;
    }

    function inlineRender(text) {
      let html = text;

      html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');

      html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

      html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

      html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

      html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

      return html;
    }

    function update() {
      const src = input.value;
      if (!src.trim()) {
        preview.innerHTML = '<div style="color:var(--text-muted);padding:20px;text-align:center;">输入 Markdown 开始预览</div>';
        return;
      }
      preview.innerHTML = renderMarkdown(src);

      preview.querySelectorAll('pre code').forEach(block => {
        block.addEventListener('dblclick', () => {
          const text = block.textContent;
          navigator.clipboard.writeText(text);
        });
      });
    }

    let debounce;
    input.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(update, 200);
    });

    update();

    function insertAtCursor(before, after = '') {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const selected = input.value.substring(start, end);
      const replacement = before + selected + after;
      input.value = input.value.substring(0, start) + replacement + input.value.substring(end);
      input.selectionStart = start + before.length;
      input.selectionEnd = start + before.length + selected.length;
      input.focus();
      update();
    }

    container.querySelector('#md-insert-heading').addEventListener('click', () => {
      insertAtCursor('## ', '\n');
    });
    container.querySelector('#md-insert-bold').addEventListener('click', () => {
      insertAtCursor('**', '**');
    });
    container.querySelector('#md-insert-italic').addEventListener('click', () => {
      insertAtCursor('*', '*');
    });
    container.querySelector('#md-insert-code').addEventListener('click', () => {
      insertAtCursor('```\n', '\n```');
    });
    container.querySelector('#md-insert-link').addEventListener('click', () => {
      insertAtCursor('[链接文本](', ')');
    });
    container.querySelector('#md-insert-list').addEventListener('click', () => {
      insertAtCursor('- ', '');
    });
    container.querySelector('#md-insert-table').addEventListener('click', () => {
      insertAtCursor('| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容 | 内容 | 内容 |\n', '');
    });
    container.querySelector('#md-clear').addEventListener('click', () => {
      input.value = '';
      update();
    });

    const style = document.createElement('style');
    style.textContent = `
      .md-split { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
      .md-pane { min-width: 0; }
      .md-preview {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 20px;
        min-height: 400px;
        max-height: 600px;
        overflow-y: auto;
        line-height: 1.7;
        color: var(--text-primary);
      }
      .md-preview h1, .md-preview h2, .md-preview h3, .md-preview h4 { margin-top: 20px; margin-bottom: 10px; font-weight: 600; }
      .md-preview h1 { font-size: 26px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
      .md-preview h2 { font-size: 22px; border-bottom: 1px solid var(--border); padding-bottom: 6px; }
      .md-preview h3 { font-size: 18px; }
      .md-preview p { margin: 10px 0; }
      .md-preview pre {
        background: var(--bg-primary);
        border: 1px solid var(--border);
        border-radius: var(--radius-sm);
        padding: 14px;
        overflow-x: auto;
        font-size: 13px;
        line-height: 1.5;
      }
      .md-preview code {
        background: var(--bg-tertiary);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: var(--font-mono);
        font-size: 13px;
      }
      .md-preview pre code { background: none; padding: 0; border-radius: 0; }
      .md-preview blockquote {
        border-left: 4px solid var(--accent);
        padding: 4px 16px;
        margin: 10px 0;
        color: var(--text-secondary);
        background: var(--bg-tertiary);
        border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      }
      .md-preview table { width: 100%; border-collapse: collapse; margin: 10px 0; }
      .md-preview th, .md-preview td {
        border: 1px solid var(--border);
        padding: 8px 12px;
        text-align: left;
        font-size: 14px;
      }
      .md-preview th { background: var(--bg-tertiary); font-weight: 600; }
      .md-preview ul, .md-preview ol { padding-left: 24px; margin: 8px 0; }
      .md-preview li { margin: 4px 0; }
      .md-preview hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
      .md-preview img { max-width: 100%; border-radius: var(--radius-sm); }
      .md-preview a { color: var(--accent); text-decoration: none; }
      .md-preview a:hover { text-decoration: underline; }
      .md-preview del { color: var(--text-muted); }
      .md-toolbar { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
      @media (max-width: 768px) { .md-split { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }
};
