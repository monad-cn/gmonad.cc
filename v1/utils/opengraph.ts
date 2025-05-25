import type { PageData } from 'vitepress'

export function getOpenGraphImage(page: PageData): string {
  const pageImage = page.frontmatter?.image || page.frontmatter?.cover
  if (pageImage) {
    if (pageImage.startsWith('/')) {
      return `https://gmonad.cc${pageImage}`
    }
    return pageImage
  }
  return 'https://gmonad.cc/opengraph/basic.png'
} 