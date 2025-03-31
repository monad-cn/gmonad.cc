<template>
  <div
    class="back-to-top"
    :class="{ 'back-to-top--show': show }"
    @click="scrollToTop"
    role="button"
    aria-label="回到顶部"
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="back-to-top-icon">
      <path fill="none" d="M0 0h24v24H0z"/>
      <path d="M13 7.828V20h-2V7.828l-5.364 5.364-1.414-1.414L12 4l7.778 7.778-1.414 1.414L13 7.828z"/>
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const show = ref(false)
const scrollThreshold = 300

const checkScroll = () => {
  show.value = window.scrollY > scrollThreshold
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll)
  checkScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style>
.back-to-top {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  width: 2.5rem;
  height: 2.5rem;
  background-color: var(--vp-c-brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  opacity: 0;
  visibility: hidden;
  z-index: 100;
}

.back-to-top:hover .back-to-top-icon {
  fill: white;
}

.back-to-top--show {
  opacity: 1;
  visibility: visible;
}

.back-to-top-icon {
  width: 1.25rem;
  height: 1.25rem;
  fill: white;
}
</style>