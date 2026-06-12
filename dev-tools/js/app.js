import { tools, categories, getSortedCategories, registerTool, getTool } from './registry.js';

async function loadAllTools() {
  const toolModules = [
    './tools/json-formatter.js',
    './tools/base64.js',
    './tools/url-encoder.js',
    './tools/timestamp.js',
    './tools/uuid.js',
    './tools/hash-generator.js',
    './tools/color-converter.js',
    './tools/regex-tester.js',
    './tools/html-entities.js',
    './tools/jwt-decoder.js',
    './tools/diff-checker.js',
    './tools/yaml-json.js',
    './tools/lorem-ipsum.js',
    './tools/case-converter.js',
    './tools/number-base.js',
  ];
  for (const mod of toolModules) {
    try {
      const m = await import(mod);
      if (m.default) registerTool(m.default);
    } catch (e) {
      console.error(`Failed to load tool: ${mod}`, e);
    }
  }
}

function renderSidebar(filter = '') {
  const nav = document.getElementById('tool-nav');
  const query = filter.toLowerCase().trim();
  let html = '';
  const sorted = getSortedCategories();
  for (const [, cat] of sorted) {
    const filtered = cat.tools.filter(t => t.name.toLowerCase().includes(query));
    if (query && filtered.length === 0) continue;
    if (query) {
      for (const tool of filtered) {
        html += `<div class="tool-nav-item" data-tool="${tool.id}">
          <span class="nav-icon">${tool.icon}</span>
          <span class="nav-name">${tool.name}</span>
        </div>`;
      }
    } else {
      html += `<div class="category-title">${cat.icon} ${cat.name}</div>`;
      for (const tool of cat.tools) {
        html += `<div class="tool-nav-item" data-tool="${tool.id}">
          <span class="nav-icon">${tool.icon}</span>
          <span class="nav-name">${tool.name}</span>
        </div>`;
      }
    }
  }
  nav.innerHTML = html;

  document.querySelectorAll('.tool-nav-item').forEach(el => {
    el.addEventListener('click', () => {
      activateTool(el.dataset.tool);
    });
  });

  document.getElementById('tool-count').textContent = `${tools.length} 工具`;
}

let currentToolId = null;

function activateTool(id) {
  const tool = getTool(id);
  if (!tool) return;

  currentToolId = id;
  document.querySelectorAll('.tool-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === id);
  });

  document.getElementById('welcome-screen')?.remove();

  const container = document.getElementById('tool-container');
  container.innerHTML = `
    <div class="tool-header">
      <h2><span>${tool.icon}</span> ${tool.name}</h2>
      <p>${tool.description}</p>
    </div>
    <div id="tool-content">${tool.render()}</div>
  `;

  if (tool.init) {
    tool.init(document.getElementById('tool-content'));
  }

  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }
}

function setupSearch() {
  const input = document.getElementById('search-input');
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      renderSidebar(input.value);
    }, 150);
  });
}

function setupSidebarToggle() {
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
}

function setupExtensionGuide() {
  document.getElementById('add-tool-link').addEventListener('click', (e) => {
    e.preventDefault();
    showExtensionModal();
  });
}

function showExtensionModal() {
  const existing = document.querySelector('.modal-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay show';
  overlay.innerHTML = `
    <div class="modal">
      <h2>&#x1F527; 如何扩展工具</h2>
      <p>在 <code>dev-tools/js/tools/</code> 目录下创建新的 <code>.js</code> 文件，遵循以下模板：</p>
      <pre>export default {
  id: 'my-tool',
  name: '我的工具',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '&#x1F504;',
  icon: '&#x2699;',
  description: '工具描述',
  render() {
    return \`&lt;div class="tool-card"&gt;...&lt;/div&gt;\`;
  },
  init(container) {
    // 事件绑定
  }
};</pre>
      <p>然后在 <code>js/app.js</code> 的 <code>loadAllTools</code> 中添加导入：</p>
      <pre>import './tools/my-tool.js';</pre>
      <p><strong>分类说明：</strong></p>
      <ul>
        <li><code>converters</code> - 转换工具</li>
        <li><code>generators</code> - 生成工具</li>
        <li><code>formatters</code> - 格式化工具</li>
        <li><code>testers</code> - 测试工具</li>
        <li><code>encoders</code> - 编解码工具</li>
      </ul>
      <button class="btn btn-primary close-btn" onclick="this.closest('.modal-overlay').remove()">知道了</button>
    </div>
  `;
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

let toastTimer;

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  clearTimeout(toastTimer);
  setTimeout(() => toast.remove(), 2500);
}

export async function copyToClipboard(text, msg = '已复制') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(msg);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast(msg);
  }
}

async function init() {
  await loadAllTools();
  renderSidebar();
  setupSearch();
  setupSidebarToggle();
  setupExtensionGuide();
}

init();
