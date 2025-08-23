import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function parseMd(markdown: string): string {
  if (typeof window === 'undefined') {
    return markdown || '';
  }

  try {
    const rawHtml = marked.parse(markdown || '') as string;
    return DOMPurify.sanitize(rawHtml, { FORBID_TAGS: ['img'] });
  } catch (error) {
    console.error('Failed to parse markdown:', error);
    return markdown || '';
  }
}
