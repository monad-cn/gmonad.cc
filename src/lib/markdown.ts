import { marked } from 'marked';

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

export async function parseMarkdown(content: string, options: MarkdownParseOptions = {}): Promise<string> {
  const config = { ...defaultOptions, ...options };
  
  marked.setOptions(config);
  
  return await marked(content);
}

export function parseMarkdownToTokens(content: string): any[] {
  return marked.lexer(content);
}

export function extractHeadings(content: string): Array<{ level: number; text: string; id?: string }> {
  const tokens = parseMarkdownToTokens(content);
  const headings: Array<{ level: number; text: string; id?: string }> = [];
  const idCounts = new Map<string, number>();
  
  tokens.forEach(token => {
    if (token.type === 'heading') {
      let baseId = token.text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      
      // 处理空 ID
      if (!baseId) {
        baseId = 'heading';
      }
      
      // 处理重复 ID
      const count = idCounts.get(baseId) || 0;
      idCounts.set(baseId, count + 1);
      
      const finalId = count > 0 ? `${baseId}-${count}` : baseId;
      
      headings.push({
        level: token.depth,
        text: token.text,
        id: finalId
      });
    }
  });
  
  return headings;
}

export function extractText(content: string): string {
  const tokens = parseMarkdownToTokens(content);
  let text = '';
  
  const extractTokenText = (token: any): string => {
    let result = '';
    
    switch (token.type) {
      case 'text':
        result = token.text;
        break;
      case 'paragraph':
        result = token.text;
        break;
      case 'heading':
        result = token.text;
        break;
      case 'code':
        result = token.text;
        break;
      case 'codespan':
        result = token.text;
        break;
      case 'list':
        if ('items' in token) {
          result = token.items.map((item: any) => extractTokenText(item)).join(' ');
        }
        break;
      case 'list_item':
        if ('text' in token) {
          result = token.text;
        }
        break;
      case 'blockquote':
        if ('text' in token) {
          result = token.text;
        }
        break;
      default:
        if ('text' in token) {
          result = token.text;
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
    // 只处理 2 级标题
    if (heading.level === 2) {
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