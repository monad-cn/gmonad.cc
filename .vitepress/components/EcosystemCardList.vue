<!-- EcosystemCardList.vue 父组件 -->
<template>
  <div class="cards-container">
    <EcosystemCard
        v-for="(item, index) in items"
        :key="index"
        :item="item"
    />
  </div>
</template>

<script>
import EcosystemCard from './EcosystemCard.vue'

export default {
  components: { EcosystemCard },
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<style scoped>

.cards-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  padding: 2rem; /* 容器内边距 */
}

/* 响应式调整 */
@media (max-width: 1536px) { /* 适配大屏幕 */
  .cards-container-wrapper {
    padding: 0 4%;
  }
}

@media (max-width: 1280px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .cards-container-wrapper {
    padding: 0 2rem;
  }
}

@media (max-width: 768px) {
  .cards-container {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }

  .cards-container-wrapper {
    padding: 0 1.5rem;
  }
}

@media (max-width: 480px) {
  .cards-container-wrapper {
    padding: 0 1rem;
  }

  .cards-container {
    padding: 1rem;
  }
}
</style>