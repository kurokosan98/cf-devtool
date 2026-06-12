export const tools = [];
export const categories = {};

export function registerTool(tool) {
  tools.push(tool);
  if (!categories[tool.category]) {
    categories[tool.category] = { name: tool.categoryName, icon: tool.categoryIcon, tools: [] };
  }
  categories[tool.category].tools.push(tool);
}

export function getTool(id) {
  return tools.find(t => t.id === id);
}

export function getToolsByCategory(category) {
  return categories[category]?.tools || [];
}

const categoryOrder = ['converters', 'generators', 'formatters', 'testers', 'encoders'];

export function getSortedCategories() {
  return Object.entries(categories).sort((a, b) => {
    const ia = categoryOrder.indexOf(a[0]);
    const ib = categoryOrder.indexOf(b[0]);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
}
