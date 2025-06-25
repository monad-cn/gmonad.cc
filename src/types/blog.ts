export interface Blog {
  id: number;
  name: string;
  content: string;
  author: string;
  translation?: string;
  layout: string;
  tags: string[];
  date: string;
}
