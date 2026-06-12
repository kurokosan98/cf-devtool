import { showToast } from '../app.js';

export default {
  id: 'number-base',
  name: '进制转换',
  category: 'converters',
  categoryName: '转换',
  categoryIcon: '🔄',
  icon: '🔢',
  description: '二进制、八进制、十进制、十六进制互相转换',
  render() {
    return `
      <div class="tool-card">
        <div class="base-input-row">
          <div>
            <label>输入值</label>
            <input type="text" id="nb-input" class="tool-input" placeholder="输入数字">
          </div>
          <div>
            <label>输入进制</label>
            <select id="nb-from" class="tool-select">
              <option value="2">二进制 (2)</option>
              <option value="8">八进制 (8)</option>
              <option value="10" selected>十进制 (10)</option>
              <option value="16">十六进制 (16)</option>
            </select>
          </div>
          <div style="display:flex;align-items:flex-end;">
            <button class="btn btn-primary" id="nb-convert" style="width:100%;">转换</button>
          </div>
        </div>
      </div>
      <div class="tool-card">
        <label>转换结果</label>
        <div class="base-results" id="nb-results">
          <div class="base-result-item"><span class="base-label">二进制 (2)</span><span class="base-value" id="nb-base2">-</span></div>
          <div class="base-result-item"><span class="base-label">八进制 (8)</span><span class="base-value" id="nb-base8">-</span></div>
          <div class="base-result-item"><span class="base-label">十进制 (10)</span><span class="base-value" id="nb-base10">-</span></div>
          <div class="base-result-item"><span class="base-label">十六进制 (16)</span><span class="base-value" id="nb-base16">-</span></div>
        </div>
      </div>
    `;
  },
  init(container) {
    const input = container.querySelector('#nb-input');
    const fromSelect = container.querySelector('#nb-from');

    function convert() {
      const val = input.value.trim();
      if (!val) { showToast('请输入数字', 'error'); return; }
      const base = parseInt(fromSelect.value);
      const num = parseInt(val, base);
      if (isNaN(num)) {
        showToast('输入无效，请检查数字和进制是否匹配', 'error');
        container.querySelectorAll('.base-value').forEach(el => el.textContent = '-');
        return;
      }
      container.querySelector('#nb-base2').textContent = num.toString(2);
      container.querySelector('#nb-base8').textContent = num.toString(8);
      container.querySelector('#nb-base10').textContent = num.toString(10);
      container.querySelector('#nb-base16').textContent = num.toString(16).toUpperCase();
    }

    container.querySelector('#nb-convert').addEventListener('click', convert);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') convert(); });
  }
};
