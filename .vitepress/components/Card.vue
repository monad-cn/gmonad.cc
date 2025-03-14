<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  },
  category: {
    type: String,
    default: 'App/Infra'
  }
})
</script>

<template>
  <div class="info-card">
    <div class="info-card__header">
      <div class="info-card__header-content">
        <svg class="info-card__header-logo" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 3L4 15h16L12 3zm0 3.5L16.5 13h-9L12 6.5z"/>
        </svg>
        <span class="info-card__header-text">AGORA</span>
      </div>
      <div class="info-card__header-right">
        <span class="info-card__category">{{ category }}</span>
        <div class="info-card__icons">
          <button class="info-card__icon-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
            </svg>
          </button>
          <button class="info-card__icon-button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="info-card__content">
      <div class="info-card__logo-wrapper">
        <svg class="info-card__logo" viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d="M12 3L4 15h16L12 3zm0 3.5L16.5 13h-9L12 6.5z"/>
        </svg>
      </div>
      <h3 class="info-card__title">{{ title }}</h3>
      <p class="info-card__description">{{ description }}</p>
      <div class="info-card__tags">
        <span v-for="(tag, index) in tags" :key="index" class="info-card__tag">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>


