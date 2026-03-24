<!-- src/components/PokemonGrid.vue -->
<template>
  <!-- Solo mostrar skeleton durante carga -->
  <div
    v-if="isLoading"
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
  >
    <SkeletonLoader :count="itemsPerPage" />
  </div>

  <!-- Mostrar grid solo cuando NO está cargando y hay Pokémon -->
  <div
    v-else-if="pokemons.length > 0"
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
  >
    <PokemonCard v-for="pokemon in pokemons" :key="pokemon.id" :pokemon="pokemon" />
  </div>

  <!-- No mostrar nada mientras carga (el skeleton ya se ve) -->
  <!-- El EmptyState se maneja desde Home.vue cuando no hay carga y no hay resultados -->
</template>

<script setup>
import PokemonCard from './PokemonCard.vue'
import SkeletonLoader from './SkeletonLoader.vue'

defineProps({
  pokemons: {
    type: Array,
    required: true,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  itemsPerPage: {
    type: Number,
    default: 24,
  },
})
</script>
