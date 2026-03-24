<!-- src/pages/Home.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 to-white">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-black text-red-800 mb-2">Pokédex</h1>
        <p class="text-gray-600 text-lg">Explora los {{ totalPokemons }} Pokémon</p>
      </div>

      <!-- Filtros -->
      <PokemonFilters
        v-model:search-query="searchQuery"
        v-model:primary-type="selectedPrimaryType"
        v-model:secondary-type="selectedSecondaryType"
        v-model:generation="selectedGeneration"
        v-model:show-megas="showOnlyMegas"
        :pokemon-types="pokemonTypes"
        :generation-options="generationOptions"
        :has-active-filters="hasActiveFilters"
        :total-results="totalItems"
        :is-filtering="isFiltering"
        @reset="resetFilters"
        @remove-filter="removeFilter"
      />

      <!-- Grid de Pokémon -->
      <PokemonGrid
        :pokemons="paginatedPokemons"
        :is-loading="isLoading || isFiltering"
        :items-per-page="itemsPerPage"
      />

      <!-- Empty State -->
      <EmptyState
        v-if="!isLoading && !isFiltering && paginatedPokemons.length === 0"
        @reset="resetFilters"
      />

      <!-- Paginación -->
      <PokemonPagination
        v-if="totalPages > 1"
        :current-page="currentPage"
        :total-pages="totalPages"
        :visible-pages="visiblePages"
        :items-per-page="itemsPerPage"
        @page-change="goToPage"
        @update-items-per-page="(value) => (itemsPerPage = value)"
      />
    </div>
    <ScrollToTop />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonListStore } from '../stores/pokemonListStore.js'
import { usePokemonFilters } from '../composables/usePokemonFilters.js'
import { usePokemonPagination } from '../composables/usePokemonPagination.js'
import { usePokemonGeneration } from '../composables/usePokemonGeneration.js'

// Componentes
import PokemonFilters from '../components/PokemonFilters.vue'
import PokemonGrid from '../components/PokemonGrid.vue'
import PokemonPagination from '../components/PokemonPagination.vue'
import EmptyState from '../components/EmptyState.vue'
import ScrollToTop from '../components/ScrollToTop.vue'

// Store
const pokemonListStore = usePokemonListStore()
const { pokemons, isLoading, allPokemons } = storeToRefs(pokemonListStore)

// Composables
const { generationOptions } = usePokemonGeneration()
const {
  searchQuery,
  selectedPrimaryType,
  selectedSecondaryType,
  selectedGeneration,
  showOnlyMegas,
  pokemonTypes,
  filteredPokemons,
  hasActiveFilters,
  isFiltering,
  resetFilters,
  removeFilter,
} = usePokemonFilters(allPokemons)

const {
  currentPage,
  itemsPerPage,
  totalItems,
  totalPages,
  paginatedItems: paginatedPokemons,
  visiblePages,
  goToPage,
} = usePokemonPagination(filteredPokemons)

// Computed
const totalPokemons = computed(() => allPokemons.value?.length || 0)

// Cargar datos al montar
onMounted(async () => {
  if (!pokemonListStore.pokemons?.length) {
    await pokemonListStore.loadPokemonList()
  }
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
