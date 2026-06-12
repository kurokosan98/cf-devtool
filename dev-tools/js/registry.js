export const tools = [];
export const categories = {};
const toolModules = {};

export function registerTool(tool) {
  if (getTool(tool.id)) return;
  tools.push(tool);
  if (!categories[tool.category]) {
    categories[tool.category] = { name: tool.categoryName, icon: tool.categoryIcon, tools: [] };
  }
  categories[tool.category].tools.push(tool);
}

export function getTool(id) {
  return tools.find(t => t.id === id);
}

export function registerStatic(id, name, category, categoryName, categoryIcon, icon, description, modulePath) {
  registerTool({
    id, name, category, categoryName, categoryIcon, icon, description,
    _modulePath: modulePath,
    render() { return '<div class="tool-loading" style="text-align:center;padding:40px;color:var(--text-muted);">加载中...</div>'; },
    init() {},
  });
  toolModules[id] = modulePath;
}

export async function loadTool(id) {
  const tool = getTool(id);
  if (!tool || !tool._modulePath) return;
  const mod = await import(tool._modulePath);
  if (mod.default) {
    Object.assign(tool, mod.default);
    delete tool._modulePath;
  }
}

const categoryOrder = ['converters', 'generators', 'formatters', 'testers', 'encoders'];

export function getSortedCategories() {
  return Object.entries(categories).sort((a, b) => {
    const ia = categoryOrder.indexOf(a[0]);
    const ib = categoryOrder.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
