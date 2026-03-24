<!-- src/pages/Home.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 to-white">
    <div class="container mx-auto px-4 py-8">
      <!-- 🔴 SOLO BARRA DE CARGA MIENTRAS CARGA 🔴 -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-black text-red-800 mb-8">Pokédex</h1>

          <!-- Barra de progreso -->
          <div class="w-80 md:w-96 mb-4">
            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Cargando Pokédex...</span>
              <span>{{ Math.round(loadProgress) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
                :style="{ width: `${loadProgress}%` }"
              ></div>
            </div>
          </div>

          <p class="text-gray-500 text-sm">Cargando {{ totalPokemonsCount }} Pokémon</p>
        </div>
      </div>

      <!-- ✅ TODO EL CONTENIDO NORMAL CUANDO TERMINA LA CARGA -->
      <template v-else>
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-black text-red-800 mb-2">Pokédex</h1>
          <p class="text-gray-600 text-lg">Explora los {{ totalPokemonsCount }} Pokémon</p>
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
          :is-loading="false"
          :items-per-page="itemsPerPage"
        />

        <!-- Empty State -->
        <EmptyState
          v-if="!isFiltering && paginatedPokemons.length === 0 && allPokemonsData.length > 0"
          @reset="resetFilters"
        />

        <!-- Paginación -->
        <PokemonPagination
          v-if="totalPages > 1 && paginatedPokemons.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :visible-pages="visiblePages"
          :items-per-page="itemsPerPage"
          @page-change="goToPage"
          @update-items-per-page="handleItemsPerPageChange"
        />
      </template>
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
const { pokemons, isLoading, loadProgress, totalPokemons } = storeToRefs(pokemonListStore)

// allPokemons es un computed en el store
const allPokemonsData = computed(() => pokemonListStore.allPokemons)

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
} = usePokemonFilters(allPokemonsData)

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
const totalPokemonsCount = computed(() => totalPokemons.value || 0)

// Manejador para cambiar items por página
const handleItemsPerPageChange = (value) => {
  itemsPerPage.value = value
}

// Cargar datos al montar
onMounted(async () => {
  console.log('🟣 Home: Componente montado')

  if (!pokemons.value?.length && !isLoading.value) {
    console.log('🔄 Iniciando carga de Pokémon...')
    await pokemonListStore.loadPokemonList()
    console.log('✅ Carga completada. Total:', pokemons.value?.length)
  }
})
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
