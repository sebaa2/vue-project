<script setup>
import TopBar from '@/components/TopBar.vue'
import { useKonamiCode } from '@/composables/useKonamiCode.js'
import { useWoChien } from '@/composables/useWochien.js'
import { storeToRefs } from 'pinia'
import { useHistoryStore } from '@/stores/historyStore.js'

useKonamiCode()
useWoChien()

// Obtener el Pokémon más visitado del store
const historyStore = useHistoryStore()
const { mostVisitedPokemon } = storeToRefs(historyStore)
</script>

<template>
  <TopBar :mostVisitedPokemon="mostVisitedPokemon" />
  <router-view></router-view>
</template>

<style scoped></style>
