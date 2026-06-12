import { tools, categories, getSortedCategories, registerStatic, getTool, loadTool } from './registry.js';

const toolMeta = [
  ['json-formatter', 'JSON 格式化', 'formatters', '格式化', '📝', '📋', '格式化、验证和压缩 JSON 数据'],
  ['base64', 'Base64 编解码', 'encoders', '编解码', '🔐', '🔡', 'Base64 编码与解码'],
  ['url-encoder', 'URL 编解码', 'encoders', '编解码', '🔐', '🔗', 'URL 编码与解码'],
  ['timestamp', '时间戳转换', 'converters', '转换', '🔄', '⏱', 'Unix 时间戳与日期时间互相转换'],
  ['uuid', 'UUID 生成器', 'generators', '生成', '⚡', '🆔', '生成 UUID v4，支持批量生成'],
  ['hash-generator', 'Hash 生成器', 'generators', '生成', '⚡', '🔐', '计算文本的 MD5、SHA1、SHA256、SHA512 哈希值'],
  ['color-converter', '颜色转换', 'converters', '转换', '🔄', '🎨', 'HEX、RGB、HSL 颜色互相转换'],
  ['regex-tester', '正则测试', 'testers', '测试', '🧪', '🔍', '测试正则表达式匹配，实时高亮'],
  ['qr-scanner', '二维码扫码', 'testers', '测试', '🧪', '📱', '使用摄像头扫描和解码 QR 二维码'],
  ['html-entities', 'HTML 实体编解码', 'encoders', '编解码', '🔐', '🌐', 'HTML 实体编码与解码'],
  ['jwt-decoder', 'JWT 解码器', 'encoders', '编解码', '🔐', '🔑', '解码 JSON Web Token'],
  ['diff-checker', '文本对比', 'testers', '测试', '🧪', '📊', '对比两段文本的差异'],
  ['yaml-json', 'YAML / JSON 互转', 'converters', '转换', '🔄', '📄', 'YAML 与 JSON 格式互相转换'],
  ['lorem-ipsum', 'Lorem Ipsum 生成器', 'generators', '生成', '⚡', '📝', '生成 Lorem Ipsum 占位文本'],
  ['case-converter', '大小写转换', 'converters', '转换', '🔄', '🔤', '文本大小写格式互转'],
  ['number-base', '进制转换', 'converters', '转换', '🔄', '🔢', '二进制、八进制、十进制、十六进制互转'],
  ['markdown-preview', 'Markdown 预览', 'formatters', '格式化', '📝', '📝', '实时 Markdown 编辑与预览'],
  ['qr-generator', '二维码生成', 'generators', '生成', '⚡', '📱', '生成 QR 二维码'],
];

for (const [id, name, cat, catName, catIcon, icon, desc] of toolMeta) {
  registerStatic(id, name, cat, catName, catIcon, icon, desc, `./tools/${id}.js`);
}

let currentToolId = null;

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
    el.addEventListener('click', () => activateTool(el.dataset.tool));
  });

  document.getElementById('tool-count').textContent = `${tools.length} 工具`;
}

async function activateTool(id) {
  const tool = getTool(id);
  if (!tool) return;

  document.querySelectorAll('.tool-nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === id);
  });

  document.getElementById('welcome-screen')?.remove();
  const container = document.getElementById('tool-container');

  if (tool._modulePath) {
    await loadTool(id);
  }

  container.innerHTML = `
    <div class="tool-header">
      <h2><span>${tool.icon}</span> ${tool.name}</h2>
      <p>${tool.description}</p>
    </div>
    <div id="tool-content">${tool.render()}</div>
  `;

  if (tool.init && !tool._modulePath) {
    tool.init(document.getElementById('tool-content'));
  }

  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  }
}

function setupSearch() {
  const input = document.getElementById('search-input');
  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => renderSidebar(input.value), 150);
  });
}

function setupSidebarToggle() {
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (backdrop) backdrop.classList.toggle('open');
  });
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
    });
  }
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
      <p>在 <code>dev-tools/js/tools/</code> 下新建 <code>.js</code> 文件：</p>
      <pre>export default {
  id: 'my-tool',
  name: '我的工具',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '&#x1F504;',
  icon: '&#x2699;',
  description: '工具描述',
  render() { return '...'; },
  init(container) { }
};</pre>
      <p>然后在 <code>js/app.js</code> 的 <code>toolMeta</code> 数组中添加一行：</p>
      <pre>['my-tool', '我的工具', 'converters', '转换', '&#x1F504;', '&#x2699;', '工具描述'],</pre>
      <button class="btn btn-primary close-btn" onclick="this.closest('.modal-overlay').remove()">知道了</button>
    </div>`;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
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

function init() {
  renderSidebar();
  setupSearch();
  setupSidebarToggle();
  setupExtensionGuide();
}

init();
