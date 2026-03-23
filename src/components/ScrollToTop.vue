<!-- ScrollToTop.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const showTop = ref(false)
const showBottom = ref(true)

const handleScroll = () => {
  const scrollY = window.scrollY
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight

  showTop.value = scrollY > 300
  showBottom.value = scrollY < maxScroll - 100
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const scrollToBottom = () => {
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
    <!-- Subir -->
    <Transition name="scroll-btn">
      <button
        v-if="showTop"
        @click="scrollToTop"
        aria-label="Volver arriba"
        class="w-12 h-12 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </Transition>

    <!-- Bajar -->
    <Transition name="scroll-btn">
      <button
        v-if="showBottom"
        @click="scrollToBottom"
        aria-label="Ir abajo"
        class="w-12 h-12 bg-red-600 hover:bg-red-700 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </Transition>
  </div>
</template>

<style scoped>
.scroll-btn-enter-active,
.scroll-btn-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.scroll-btn-enter-from,
.scroll-btn-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
