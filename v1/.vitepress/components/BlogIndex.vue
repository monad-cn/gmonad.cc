<template>
  <div class="blog-container">
    <!-- 所有文章区域 -->
    <div class="all-posts-section">
      <h5 class="section-title">博客</h5>
      <div v-if="posts.length > 0" class="posts-grid">
        <BlogCard v-for="post in sortedPosts" :key="post.url" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useData } from 'vitepress'
import { computed } from 'vue'
import BlogCard from './BlogCard.vue'

const { theme } = useData()

// 获取所有博客文章
const posts = computed(() => {
  console.log(theme.value.blogPosts, 'theme.value.blogPosts')
  return theme.value.blogPosts || []
})

// 按日期排序的所有文章
const sortedPosts = computed(() => {
  return [...posts.value].sort((a, b) => {
    const dateA = new Date(a.frontmatter.date || '2000-01-01')
    const dateB = new Date(b.frontmatter.date || '2000-01-01')
    return dateB - dateA
  })
})
</script>

<style scoped>
.blog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: var(--vp-c-text-1);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .posts-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
}
</style> 