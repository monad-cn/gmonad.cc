<template>
  <div class="cards-container">
    <Card
        v-for="(item, index) in items"
        :key="index"
        :item="item"
    />
  </div>
</template>

<script>
import Card from './Card.vue'

export default {
  components: { Card },
  props: {
    items: {
      type: Array,
      required: true,
      default: () => []
    }
  }
}
</script>

<style>
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


</style>