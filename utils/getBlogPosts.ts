import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export function getBlogPosts() {
  const postsDirectory = path.resolve(__dirname, '../blog')
  
  try {
    // 检查目录是否存在
    if (!fs.existsSync(postsDirectory)) {
      console.error(`博客目录不存在: ${postsDirectory}`)
      return []
    }
    
    const files = fs.readdirSync(postsDirectory)
    
    return files
      .filter(file => file.endsWith('.md') && file !== 'index.md')
      .map(file => {
        try {
          const fullPath = path.resolve(postsDirectory, file)
          const content = fs.readFileSync(fullPath, 'utf-8')
          const { data: frontmatter, excerpt } = matter(content, { excerpt: true })
          
          // 从文章内容中提取标题和描述（如果frontmatter中没有）
          const title = frontmatter.title || 
            file.replace(/\.md$/, '').replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase())
          
          let description = frontmatter.description
          if (!description && excerpt) {
            description = excerpt.replace(/\n/g, ' ').trim()
          }
          
          return {
            url: `/blog/${file.replace(/\.md$/, '')}`,
            frontmatter: {
              title,
              description: description || '',
              date: frontmatter.date ? new Date(frontmatter.date).toISOString().slice(0, 10) : '',
              cover: frontmatter.cover || frontmatter.image || '', // 支持 cover 或 image 字段
              // 预留字段，用于判断是否为精选文章
              featured: frontmatter.featured || false
            },
            // 记录原始文件名用于调试
            filename: file
          }
        } catch (error) {
          console.error(`处理文件 ${file} 时出错:`, error)
          return null
        }
      })
      .filter(post => post !== null) // 过滤掉处理失败的文章
      .sort((a, b) => {
        // 默认按日期降序排序
        const dateA = a.frontmatter.date ? new Date(a.frontmatter.date) : new Date(0)
        const dateB = b.frontmatter.date ? new Date(b.frontmatter.date) : new Date(0)
        return dateB.getTime() - dateA.getTime()
      })
  } catch (error) {
    console.error('获取博客文章时出错:', error)
    return []
  }
} 