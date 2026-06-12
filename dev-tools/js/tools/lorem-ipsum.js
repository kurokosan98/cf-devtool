import { copyToClipboard } from '../app.js';

export default {
  id: 'lorem-ipsum',
  name: 'Lorem Ipsum 生成器',
  category: 'generators',
  categoryName: '生成',
  categoryIcon: '⚡',
  icon: '📝',
  description: '生成 Lorem Ipsum 占位文本，支持段落和单词数量控制',
  render() {
    return `
      <div class="tool-card">
        <div class="lorem-options">
          <label>段落数: <input type="number" id="lorem-paragraphs" value="3" min="1" max="50"></label>
          <label>每段句子数: <input type="number" id="lorem-sentences" value="5" min="1" max="50"></label>
          <button class="btn btn-primary" id="lorem-generate">生成</button>
          <button class="btn btn-secondary" id="lorem-copy">复制</button>
        </div>
      </div>
      <div class="tool-card">
        <label>输出</label>
        <div class="output-area">
          <textarea id="lorem-output" class="tool-textarea" readonly style="min-height:200px;"></textarea>
        </div>
      </div>
    `;
  },
  init(container) {
    const output = container.querySelector('#lorem-output');
    const parasInput = container.querySelector('#lorem-paragraphs');
    const sentsInput = container.querySelector('#lorem-sentences');

    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
      'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit',
      'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
      'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
      'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'aute', 'irure', 'dolor',
      'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat',
      'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
      'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim',
      'arcu', 'bibendum', 'ultricies', 'integer', 'quis', 'auctor', 'sodales', 'ut',
      'sem', 'nulla', 'pharetra', 'diam', 'sit', 'amet', 'nisl', 'suscipit'
    ];

    function randomWord() {
      return words[Math.floor(Math.random() * words.length)];
    }

    function capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function generateSentence() {
      const len = 8 + Math.floor(Math.random() * 12);
      const sentence = [];
      for (let i = 0; i < len; i++) {
        sentence.push(randomWord());
      }
      return capitalize(sentence.join(' ')) + '.';
    }

    function generate() {
      const paras = Math.min(Math.max(parseInt(parasInput.value) || 3, 1), 50);
      const sents = Math.min(Math.max(parseInt(sentsInput.value) || 5, 1), 50);
      const result = [];
      for (let p = 0; p < paras; p++) {
        const para = [];
        for (let s = 0; s < sents; s++) {
          para.push(generateSentence());
        }
        result.push(para.join(' '));
      }
      output.value = result.join('\n\n');
    }

    container.querySelector('#lorem-generate').addEventListener('click', generate);
    container.querySelector('#lorem-copy').addEventListener('click', () => {
      if (output.value) copyToClipboard(output.value, '已复制');
    });

    generate();
  }
};
