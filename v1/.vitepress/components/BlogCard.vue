<template>
  <div class="post-card" :class="{ 'featured-card': featured }">
    <a :href="post.url" class="post-link">
      <div v-if="post.frontmatter.cover" class="post-cover">
        <img :src="post.frontmatter.cover" :alt="post.frontmatter.title" />
      </div>
      <div class="post-content">
        <h3 class="post-title">{{ post.frontmatter.title }}</h3>
        <p class="post-description">{{ post.frontmatter.description }}</p>
      </div>
    </a>
  </div>
</template>

<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.post-card {
  display: flex;
  flex-direction: column;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
}

.post-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.post-cover {
  aspect-ratio: 16/9;
  overflow: hidden;
}

.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card:hover .post-cover img {
  transform: scale(1.05);
}

.post-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.post-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.post-description {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  margin: 0;
}

.featured-card {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* Dark mode adjustments */
.dark .post-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.dark .post-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
}
</style> 