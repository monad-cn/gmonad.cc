import {marked, Token} from 'marked';

interface MarkedToken {
  type: string;
  text?: string;
  depth?: number;
  items?: MarkedToken[];
  [key: string]: unknown;
}

export interface MarkdownParseOptions {
  breaks?: boolean;
  gfm?: boolean;
  headerIds?: boolean;
  mangle?: boolean;
  pedantic?: boolean;
  sanitize?: boolean;
  silent?: boolean;
  smartLists?: boolean;
  smartypants?: boolean;
  xhtml?: boolean;
}

export const defaultOptions: MarkdownParseOptions = {
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  pedantic: false,
  sanitize: false,
  silent: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
};

// 1. 自定义换行扩展
const customLineBreakExtension = {
  name: 'customLineBreak',
  level: 'block',
  start(src: string) {
    // 寻找任意连续两个或以上换行符的位置
    return src.match(/\n{2,}/)?.index;
  },
  tokenizer(src: string) {
    // 正则表达式：匹配行首的 2 个或更多换行符
    const rule = /^\n{2,}/;
    const match = rule.exec(src);

    if (match) {
      // 如果匹配成功
      return {
        type: 'customLineBreak', // 自定义 token 类型
        raw: match[0],           // 原始匹配文本，例如 "\n\n" 或 "\n\n\n"
      };
    }
  },
  renderer(token: Token) {
    // 1. 获取原始文本中换行符的数量
    const newlineCount = (token.raw.match(/\n/g) || []).length;

    // 2. 计算需要生成多少个 <p> 标签
    const pTagCount = newlineCount - 1;

    // 3. 如果需要生成的标签数量大于0，就生成它们
    if (pTagCount > 0) {
      const pTag = '<p class="extra-break"></p>\n';
      return pTag.repeat(pTagCount);
    }

    return '';
  }
};

marked.use({ extensions: [customLineBreakExtension] });

export async function parseMarkdown(content: string, options: MarkdownParseOptions = {}): Promise<string> {
  const config = { ...defaultOptions, ...options };

  marked.setOptions(config);

  return await marked(content);
}

export function parseMarkdownToTokens(content: string): MarkedToken[] {
  return marked.lexer(content) as MarkedToken[];
}

export function extractHeadings(content: string): Array<{ level: number; text: string; id?: string }> {
  const tokens = parseMarkdownToTokens(content);
  const headings: Array<{ level: number; text: string; id?: string }> = [];
  const idCounts = new Map<string, number>();

  tokens.forEach(token => {
    if (token.type === 'heading' && token.text && token.depth) {
      // 清理标题文本中的 HTML 标签和 markdown 语法
      let cleanText = token.text.replace(/<[^>]*>/g, '').trim();
      // 移除 markdown 粗体/斜体语法
      cleanText = cleanText.replace(/\*\*(.*?)\*\*/g, '$1'); // **粗体**
      cleanText = cleanText.replace(/\*(.*?)\*/g, '$1');     // *斜体*
      cleanText = cleanText.replace(/__(.*?)__/g, '$1');     // __粗体__
      cleanText = cleanText.replace(/_(.*?)_/g, '$1');       // _斜体_
      // 移除代码块语法
      cleanText = cleanText.replace(/`(.*?)`/g, '$1');       // `代码`
      // 移除其他可能的特殊字符
      cleanText = cleanText.replace(/&#x20;/g, ' ').trim();  // HTML 实体

      // 使用与 marked 相同的 ID 生成逻辑
      let baseId = cleanText
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')        // 空格替换为连字符
        .replace(/[^\w\-\u4e00-\u9fa5]/g, ''); // 只保留字母、数字、连字符和中文字符

      // 处理空 ID
      if (!baseId) {
        baseId = 'heading';
      }

      // 处理重复 ID (marked 的方式)
      const count = idCounts.get(baseId) || 0;
      idCounts.set(baseId, count + 1);

      const finalId = count > 0 ? `${baseId}-${count}` : baseId;

      headings.push({
        level: token.depth,
        text: cleanText,
        id: finalId
      });
    }
  });

  return headings;
}

export function extractText(content: string): string {
  const tokens = parseMarkdownToTokens(content);
  let text = '';

  const extractTokenText = (token: MarkedToken): string => {
    let result = '';

    switch (token.type) {
      case 'text':
        result = token.text || '';
        break;
      case 'paragraph':
        result = token.text || '';
        break;
      case 'heading':
        result = token.text || '';
        break;
      case 'code':
        result = token.text || '';
        break;
      case 'codespan':
        result = token.text || '';
        break;
      case 'list':
        if ('items' in token && token.items) {
          result = token.items.map((item: MarkedToken) => extractTokenText(item)).join(' ');
        }
        break;
      case 'list_item':
        if ('text' in token) {
          result = token.text || '';
        }
        break;
      case 'blockquote':
        if ('text' in token) {
          result = token.text || '';
        }
        break;
      default:
        if ('text' in token) {
          result = token.text || '';
        }
    }

    return result;
  };

  tokens.forEach(token => {
    text += extractTokenText(token) + ' ';
  });

  return text.trim();
}

export function getTableOfContents(content: string): Array<{ level: number; text: string; id: string }> {
  const headings = extractHeadings(content);
  const toc: Array<{ level: number; text: string; id: string }> = [];

  headings.forEach(heading => {
    // 处理 2-4 级标题
    if (heading.level >= 2 && heading.level <= 4) {
      toc.push({
        level: heading.level,
        text: heading.text,
        id: heading.id || ''
      });
    }
  });

  return toc;
}

export async function sanitizeMarkdown(content: string): Promise<string> {
  return await parseMarkdown(content, { sanitize: true });
}
