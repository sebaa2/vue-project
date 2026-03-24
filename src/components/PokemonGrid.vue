<!-- src/components/PokemonGrid.vue -->
<template>
  <div v-if="isLoading && pokemons.length === 0">
    <SkeletonLoader :count="itemsPerPage" />
  </div>
  
  <div v-else-if="pokemons.length > 0" 
       class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    <PokemonCard
      v-for="pokemon in pokemons"
      :key="pokemon.id"
      :pokemon="pokemon"
    />
  </div>
</template>

<script setup>
import PokemonCard from './PokemonCard.vue'
import SkeletonLoader from './SkeletonLoader.vue'

defineProps({
  pokemons: {
    type: Array,
    required: true,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 24
  }
})
</script>