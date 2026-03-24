<script setup>
import TopBar from '@/components/TopBar.vue'
import { useKonamiCode } from '@/composables/useKonamiCode.js'
import { useWoChien } from '@/composables/useWochien.js'
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/stores/historyStore.js'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

useKonamiCode()
useWoChien()

// Obtener el Pokémon más visitado del store
const historyStore = useHistoryStore()
const { mostVisitedPokemon } = storeToRefs(historyStore)

// Detectar si está en home
const route = useRoute()
const isHomeRoute = computed(() => {
  return route.path === '/' || route.path === '/home'
})
</script>

<template>
  <!-- Solo mostrar TopBar si NO está en home -->
  <TopBar v-if="!isHomeRoute" :mostVisitedPokemon="mostVisitedPokemon" />
  <router-view></router-view>
</template>

<style scoped></style>
