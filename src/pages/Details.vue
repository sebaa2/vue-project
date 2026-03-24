<!-- Details.vue - Actualizado con filtro por método de aprendizaje -->
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonStore } from '../stores/pokemonStore.js'
import { useSearchStore } from '../stores/searchStore.js'
import { useEasterEggStore } from '../stores/EastereggStore.js'
import ScrollToTop from '../components/ScrollToTop.vue'
import BarChar from '../components/BarChar.vue'
import RadarChar from '../components/RadarChar.vue'
import EvolutionChain from '../components/EvolutionChain.vue'
import EeveeEvolutions from '../components/EeveeEvolutions.vue'
import MoveTable from '../components/moves/MoveTable.vue'
import { formatPoke } from '../helpers/formatPoke.js'
import { formatTipos, getTiposOptions, getCategoriasOptions } from '../config/arrayTipo.js'
import notFound from '../assets/images/noFound.png'

// Constantes y configuraciones
const EEVEE_FAMILY = new Set([
  'eevee',
  'vaporeon',
  'jolteon',
  'flareon',
  'espeon',
  'umbreon',
  'leafeon',
  'glaceon',
  'sylveon',
  'eevee-gmax',
  'eevee-starter',
  'vaporeon-gmax',
  'jolteon-gmax',
  'flareon-gmax',
  'espeon-gmax',
  'umbreon-gmax',
  'leafeon-gmax',
  'glaceon-gmax',
  'sylveon-gmax',
])

// Métodos de aprendizaje disponibles
const LEARNING_METHODS = {
  'level-up': 'Nivel',
  'machine': 'MT/MO',
  'egg': 'Huevo',
  'tutor': 'Tutor'
}

// Stores
const route = useRoute()
const router = useRouter()
const pokemonStore = usePokemonStore()
const searchStore = useSearchStore()
const easterEggStore = useEasterEggStore()

// Store refs
const {
  pokemon,
  evolutions,
  movesPokemon,
  isLoading,
  useFallbackSprite,
  stats,
  formattedTypes,
  currentSprite,
  filteredForms,
} = storeToRefs(pokemonStore)

const {
  searchTerm,
  searchTermDebounced,
  selectedType,
  selectedCategory,
  selectedMethod, // Nuevo
  sortBy,
  sortOrder,
  isSearchActive,
  isTyping,
} = storeToRefs(searchStore)

// Store actions
const { loadPokemon, selectForm, goToEvolution, handleImageError } = pokemonStore
const {
  setSearchTerm,
  setSelectedType,
  setSelectedCategory,
  setSelectedMethod, // Nuevo
  setSortBy,
  toggleSortOrder,
  resetFilters,
} = searchStore

// Estado local
const isBarChart = ref(true)
const isShiny = ref(false)
const activeForm = ref(null)

// Computed
const isGigantamax = computed(() => pokemon.value?.name?.includes('-gmax') || false)

// Función para manejar la actualización del ordenamiento desde MoveTable
const handleUpdateSort = (sortData) => {
  const { sortBy: newSortBy, sortOrder: newSortOrder } = sortData

  if (newSortBy === null) {
    // Si es null, desactivar ordenamiento
    setSortBy(null)
  } else {
    // Si hay una columna, actualizar
    setSortBy(newSortBy)
    if (sortOrder.value !== newSortOrder) {
      toggleSortOrder()
    }
  }
}

// Opciones de tipos para los filtros (usando arrayTipo.js)
const tipoOptions = computed(() => {
  // Obtener tipos únicos de los movimientos
  const uniqueTypes = [...new Set(movesPokemon.value.map((move) => move.type))]
  const allTypesOptions = getTiposOptions()

  // Filtrar solo los tipos que aparecen en los movimientos
  const availableTypes = allTypesOptions.filter((option) => uniqueTypes.includes(option.value))

  return [{ value: 'all', label: 'Todos los tipos' }, ...availableTypes]
})

// Opciones de categorías para los filtros (usando arrayTipo.js)
const categoriaOptions = computed(() => {
  // Obtener categorías únicas de los movimientos
  const uniqueCats = [...new Set(movesPokemon.value.map((move) => move.category))]
  const allCategoriesOptions = getCategoriasOptions()

  // Filtrar solo las categorías que aparecen en los movimientos
  const availableCategories = allCategoriesOptions.filter((option) =>
    uniqueCats.includes(option.value),
  )

  return [{ value: 'all', label: 'Todas las categorías' }, ...availableCategories]
})

// Nuevo: Opciones de métodos de aprendizaje
const methodOptions = computed(() => {
  // Obtener métodos únicos de los movimientos
  const uniqueMethods = [...new Set(movesPokemon.value.map((move) => move.learnMethod))]
  
  // Crear opciones para el desplegable
  const options = uniqueMethods
    .filter(method => LEARNING_METHODS[method]) // Solo métodos válidos
    .map(method => ({
      value: method,
      label: LEARNING_METHODS[method]
    }))
  
  return [{ value: 'all', label: 'Todos los métodos' }, ...options]
})

// Computed para filtrar y ordenar los movimientos
const filteredAndSortedMoves = computed(() => {
  let moves = [...movesPokemon.value]
  const searchValue = searchTermDebounced.value?.toLowerCase()

  // 1. Aplicar búsqueda por nombre
  if (searchValue) {
    moves = moves.filter(
      (move) =>
        move.name.toLowerCase().includes(searchValue) ||
        move.effect?.toLowerCase().includes(searchValue),
    )
  }

  // 2. Aplicar filtro por tipo
  if (selectedType.value !== 'all') {
    moves = moves.filter((move) => move.type === selectedType.value)
  }

  // 3. Aplicar filtro por categoría
  if (selectedCategory.value !== 'all') {
    moves = moves.filter((move) => move.category === selectedCategory.value)
  }

  // 4. Nuevo: Aplicar filtro por método de aprendizaje
  if (selectedMethod.value !== 'all') {
    moves = moves.filter((move) => move.learnMethod === selectedMethod.value)
  }

  // 5. Aplicar ordenamiento solo si hay un sortBy definido y no es null
  if (sortBy.value && sortBy.value !== null) {
    return moves.sort((a, b) => {
      let aVal = a[sortBy.value]
      let bVal = b[sortBy.value]

      // Manejar valores nulos/undefined
      if (aVal === null || aVal === undefined) {
        aVal = sortBy.value === 'name' ? 'zzz' : -Infinity
      }
      if (bVal === null || bVal === undefined) {
        bVal = sortBy.value === 'name' ? 'zzz' : -Infinity
      }

      // Para nombres, ordenar alfabéticamente
      if (sortBy.value === 'name') {
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
        if (sortOrder.value === 'asc') {
          return aVal.localeCompare(bVal)
        } else {
          return bVal.localeCompare(aVal)
        }
      }

      // Para valores numéricos
      if (sortOrder.value === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })
  }

  // Si no hay sortBy (null), devolver los movimientos sin ordenar (orden original)
  return moves
})

// Métodos
const changeChart = () => (isBarChart.value = !isBarChart.value)
const toggleShiny = () => (isShiny.value = !isShiny.value)
const goToHome = () => router.push('/')
const handleHiddenButtonClick = () => easterEggStore.triggerSilla()

const handleSelectForm = async (form) => {
  activeForm.value = form.pokemon.name
  await selectForm(form)
  resetFilters()
}

const formatName = (name) => {
  const parts = name.split('-')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }
  return parts
    .slice(1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Watch para cambios de ruta
watch(route, async () => {
  await loadPokemon(route.params.id)
  resetFilters()
  await nextTick()
})

// Lifecycle
onMounted(async () => {
  await loadPokemon(route.params.id)
  await nextTick()
})

onUnmounted(() => {
  const timeout = searchStore._debounceTimeout
  if (timeout) clearTimeout(timeout)
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen" />

  <div v-else-if="pokemon" class="w-full max-w-6xl mx-auto rounded-xl p-6 md:p-10 shadow-lg">
    <!-- Botón de volver -->
    <div class="mb-4">
      <button
        @click="goToHome"
        class="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md hover:shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Volver al Inicio
      </button>
    </div>

    <h1 class="font-black md:text-3xl text-xl text-red-900 mb-2">
      <span>{{ formatPoke(pokemon.name) }}</span>
      <span class="text-gray-400 text-base font-mono bg-gray-100 px-2 py-1 rounded-md">
        #{{ String(pokemon.id).padStart(3, '0') }}
      </span>
    </h1>

    <!-- Tipos y shiny toggle -->
    <div class="flex flex-wrap items-center gap-3 mt-3">
      <span
        v-for="tipo in formattedTypes"
        :key="tipo.tipo"
        :class="tipo.color"
        class="py-1 px-3 shadow-md rounded-full text-white font-semibold"
      >
        {{ tipo.tipo }}
      </span>

      <div class="relative inline-flex items-center gap-3">
        <button
          @click="toggleShiny"
          class="relative inline-flex items-center h-8 rounded-full w-14 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          :class="isShiny ? 'bg-purple-500' : 'bg-gray-300'"
          :aria-label="isShiny ? 'Cambiar a modo normal' : 'Cambiar a modo shiny'"
        >
          <span
            class="inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 shadow-md flex items-center justify-center"
            :class="isShiny ? 'translate-x-7' : 'translate-x-1'"
          >
            <span v-if="isShiny" class="text-xs">✨</span>
          </span>
        </button>
        <span class="text-sm font-medium" :class="isShiny ? 'text-purple-600' : 'text-gray-600'">
          {{ isShiny ? 'Modo Shiny' : 'Modo Normal' }}
        </span>
        <button
          @click="handleHiddenButtonClick"
          class="absolute right-[-40px] top-0 w-10 h-10 opacity-0 cursor-pointer hover:opacity-20 transition-opacity"
          aria-label="Botón secreto"
        />
      </div>
    </div>

    <!-- Sprites -->
    <div class="grid grid-cols-1 sm:grid-cols-2 place-items-center gap-1 mt-4">
      <div class="text-center">
        <img
          class="w-30"
          :src="isShiny ? currentSprite.front_shiny : currentSprite.front_default"
          @error="(e) => handleImageError(e, notFound)"
          :alt="`${formatPoke(pokemon.name)} frente ${isShiny ? 'shiny' : 'normal'}`"
        />
        <p class="text-sm text-gray-600 mt-2">Frente</p>
      </div>
      <div class="text-center">
        <img
          class="w-30"
          :src="isShiny ? currentSprite.back_shiny : currentSprite.back_default"
          @error="(e) => handleImageError(e, notFound)"
          :alt="`${formatPoke(pokemon.name)} espalda ${isShiny ? 'shiny' : 'normal'}`"
        />
        <p class="text-sm text-gray-600 mt-2">Espalda</p>
      </div>
    </div>

    <p v-if="useFallbackSprite" class="text-center mt-2 text-xs text-gray-500">
      Usando sprite estático (GIF no disponible)
    </p>

    <!-- Formas alternativas -->
    <div v-if="filteredForms.length > 1" class="mt-4 text-center">
      <h2 class="text-lg sm:text-xl md:text-2xl font-bold">Formas</h2>
      <div class="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3 mt-2">
        <button
          v-for="form in filteredForms"
          :key="form.pokemon.name"
          @click="handleSelectForm(form)"
          :class="[
            'px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-sm font-medium rounded-lg shadow transition-all duration-200 focus:outline-none focus:ring-2',
            activeForm === form.pokemon.name
              ? 'bg-blue-700 text-white scale-105 ring-blue-400'
              : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 hover:scale-105 active:scale-95',
          ]"
        >
          {{ formatName(form.pokemon.name) }}
        </button>
      </div>
    </div>

    <!-- Cadenas de evolución -->
    <EeveeEvolutions
      :evolutions="evolutions"
      :current-pokemon="pokemon.name"
      :on-go-to-evolution="goToEvolution"
    />

    <EvolutionChain
      v-if="!EEVEE_FAMILY.has(pokemon?.name)"
      :evolutions="evolutions"
      :current-pokemon="pokemon.name"
      :on-go-to-evolution="goToEvolution"
    />

    <!-- Gráficos de estadísticas -->
    <div class="mt-8">
      <button
        @click="changeChart"
        class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4 transition-colors"
      >
        {{ isBarChart ? 'Ver Radar' : 'Ver Barras' }}
      </button>
      <div
        v-if="formattedTypes.length"
        :class="[
          isBarChart ? formattedTypes[0].color : '',
          'w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto rounded shadow-lg',
          { 'flex justify-center items-center': !isBarChart },
        ]"
      >
        <component :is="isBarChart ? BarChar : RadarChar" :stats="stats" />
      </div>
    </div>

    <!-- Sección de movimientos modularizada -->
    <div v-if="!isGigantamax" class="mt-8">
      <MoveTable
        :moves="filteredAndSortedMoves"
        :total-moves="movesPokemon.length"
        :filtered-count="filteredAndSortedMoves.length"
        :is-search-active="isSearchActive"
        :tipo-options="tipoOptions"
        :categoria-options="categoriaOptions"
        :method-options="methodOptions"
        :search-term="searchTerm"
        :selected-type="selectedType"
        :selected-category="selectedCategory"
        :selected-method="selectedMethod"
        :sort-by="sortBy"
        :sort-order="sortOrder"
        :is-typing="isTyping"
        @update:search-term="setSearchTerm"
        @update:selected-type="setSelectedType"
        @update:selected-category="setSelectedCategory"
        @update:selected-method="setSelectedMethod"
        @update:sort="handleUpdateSort"
        @reset-filters="resetFilters"
      />
    </div>

    <div v-else class="mt-8 text-center text-gray-400 italic">
      Sin movimientos disponibles para formas Gigantamax
    </div>

    <ScrollToTop />
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <p class="text-gray-500">Pokémon no encontrado</p>
  </div>
</template>

<style scoped>
.hidden-button {
  transition: opacity 0.3s;
}
.hidden-button:hover {
  opacity: 0.2 !important;
}
</style>