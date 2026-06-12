import { showToast, copyToClipboard } from '../app.js';

export default {
  id: 'yaml-json',
  name: 'YAML / JSON 互转',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '🔄',
  icon: 'YML',
  description: 'YAML 与 JSON 格式互相转换',
  render() {
    return `
      <div class="tool-card">
        <div class="inline-row">
          <select id="yj-mode" class="tool-select">
            <option value="yaml2json">YAML &rarr; JSON</option>
            <option value="json2yaml">JSON &rarr; YAML</option>
          </select>
          <button class="btn btn-primary" id="yj-convert">转换 &darr;</button>
          <button class="btn btn-secondary" id="yj-clear">清空</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输入</label>
        <textarea id="yj-input" class="tool-textarea" placeholder="粘贴输入..." style="min-height:200px;"></textarea>
      </div>
      <div class="tool-card">
        <label>输出</label>
        <div class="output-area">
          <textarea id="yj-output" class="tool-textarea" readonly placeholder="结果将显示在这里..." style="min-height:200px;"></textarea>
          <button class="copy-btn" id="yj-copy">复制</button>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#yj-input');
    const output = container.querySelector('#yj-output');
    const mode = container.querySelector('#yj-mode');

    function yamlToJson(yaml) {
      const lines = yaml.split('\n');
      const result = {};
      const stack = [{ obj: result, indent: -1 }];

      for (const line of lines) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        const indent = line.search(/\S/);
        const content = line.trim();
        const colonIdx = content.indexOf(':');
        if (colonIdx === -1) continue;
        const key = content.slice(0, colonIdx).trim();
        const val = content.slice(colonIdx + 1).trim();

        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
          stack.pop();
        }
        const current = stack[stack.length - 1].obj;

        if (val === '' || val === '|' || val === '>') {
          const newObj = {};
          if (Array.isArray(current)) {
            current.push(newObj);
            stack.push({ obj: newObj, indent });
          } else {
            current[key] = newObj;
            stack.push({ obj: newObj, indent });
          }
        } else if (val.startsWith('[') || val.startsWith('{')) {
          try {
            current[key] = JSON.parse(val.replace(/'/g, '"'));
          } catch {
            current[key] = val;
          }
        } else if (val === 'true') current[key] = true;
        else if (val === 'false') current[key] = false;
        else if (val === 'null' || val === '~') current[key] = null;
        else if (!isNaN(val) && val !== '') current[key] = Number(val);
        else current[key] = val.replace(/^['"]|['"]$/g, '');
      }
      return result;
    }

    function jsonToYaml(obj, indent = 0) {
      const sp = '  '.repeat(indent);
      if (obj === null || obj === undefined) return 'null';
      if (typeof obj === 'string') {
        if (obj.includes(':') || obj.includes('#') || obj.includes("'") || obj === '' || obj.includes('\n')) {
          return `'${obj.replace(/'/g, "''")}'`;
        }
        return obj;
      }
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        return '\n' + obj.map(item => {
          if (typeof item === 'object' && item !== null) {
            return sp + '  - ' + jsonToYaml(item, indent + 2).trimStart();
          }
          return sp + '  - ' + jsonToYaml(item, indent + 2).trimStart();
        }).join('\n');
      }
      if (typeof obj === 'object') {
        const keys = Object.keys(obj);
        if (keys.length === 0) return '{}';
        return '\n' + keys.map(k => {
          const v = obj[k];
          if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
            return sp + '  ' + k + ':' + jsonToYaml(v, indent + 2);
          }
          return sp + '  ' + k + ': ' + jsonToYaml(v, indent + 2).trimStart();
        }).join('\n');
      }
      return String(obj);
    }

    function convert() {
      const text = input.value.trim();
      if (!text) { showToast('请输入内容', 'error'); return; }
      try {
        if (mode.value === 'yaml2json') {
          const parsed = yamlToJson(text);
          output.value = JSON.stringify(parsed, null, 2);
        } else {
          const parsed = JSON.parse(text);
          output.value = jsonToYaml(parsed).trim();
        }
      } catch (e) {
        output.value = `❌ 转换错误: ${e.message}`;
      }
    }

    container.querySelector('#yj-convert').addEventListener('click', convert);
    container.querySelector('#yj-clear').addEventListener('click', () => {
      input.value = '';
      output.value = '';
    });
    container.querySelector('#yj-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value);
    });
  }
};
