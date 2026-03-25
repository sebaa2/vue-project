<!-- Details.vue -->
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonStore } from '../stores/pokemonStore.js'
import { useSearchStore } from '../stores/searchStore.js'
import { useEasterEggStore } from '../stores/EastereggStore.js'
import { useMiku } from '../composables/useMiku.js'
import { useAbilityModal } from '../composables/useAbilityModal.js'
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

const MIKU_POKEMON_IDS = [83, 648] // Farfetch'd (83) y Meloetta (648)

// Métodos de aprendizaje disponibles
const LEARNING_METHODS = {
  'level-up': 'Nivel',
  machine: 'MT/MO',
  egg: 'Huevo',
  tutor: 'Tutor',
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
  normalAbilities,
  hiddenAbility,
} = storeToRefs(pokemonStore)

const {
  searchTerm,
  searchTermDebounced,
  selectedType,
  selectedCategory,
  selectedMethod,
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
  setSelectedMethod,
  setSortBy,
  toggleSortOrder,
  resetFilters,
} = searchStore

// Estado local
const isBarChart = ref(true)
const isShiny = ref(false)
const activeForm = ref(null)

let mikuComposable = null

// Modal de habilidades
const {
  selectedAbility,
  loadingAbility,
  abilityNames,
  toggleAbility,
  getCachedAbilityName,
  preloadAbilityNames,
  setupClickOutside,
  cleanupClickOutside,
} = useAbilityModal()

// Computed
const isGigantamax = computed(() => pokemon.value?.name?.includes('-gmax') || false)

// Computed para verificar si el Easter Egg debe estar activo
const isMikuEasterEggActive = computed(() => {
  return pokemon.value && MIKU_POKEMON_IDS.includes(pokemon.value.id)
})

// Función para manejar la actualización del ordenamiento desde MoveTable
const handleUpdateSort = (sortData) => {
  const { sortBy: newSortBy, sortOrder: newSortOrder } = sortData

  // Si es null, resetear ordenamiento
  if (newSortBy === null) {
    setSortBy(null)
    return
  }

  // Si el ordenamiento es por nivel
  if (newSortBy === 'level') {
    setSortBy('level')
    if (sortOrder.value !== newSortOrder) {
      toggleSortOrder()
    }
    return
  }

  // Para otros campos
  setSortBy(newSortBy)
  if (sortOrder.value !== newSortOrder) {
    toggleSortOrder()
  }
}

// Opciones de tipos para los filtros (usando arrayTipo.js)
const tipoOptions = computed(() => {
  const uniqueTypes = [...new Set(movesPokemon.value.map((move) => move.type))]
  const allTypesOptions = getTiposOptions()
  const availableTypes = allTypesOptions.filter((option) => uniqueTypes.includes(option.value))
  return [{ value: 'all', label: 'Todos los tipos' }, ...availableTypes]
})

// Opciones de categorías para los filtros (usando arrayTipo.js)
const categoriaOptions = computed(() => {
  const uniqueCats = [...new Set(movesPokemon.value.map((move) => move.category))]
  const allCategoriesOptions = getCategoriasOptions()
  const availableCategories = allCategoriesOptions.filter((option) =>
    uniqueCats.includes(option.value),
  )
  return [{ value: 'all', label: 'Todas las categorías' }, ...availableCategories]
})

// Opciones de métodos de aprendizaje
const methodOptions = computed(() => {
  const uniqueMethods = [...new Set(movesPokemon.value.map((move) => move.learnMethod))]
  const options = uniqueMethods
    .filter((method) => LEARNING_METHODS[method])
    .map((method) => ({
      value: method,
      label: LEARNING_METHODS[method],
    }))
  return [{ value: 'all', label: 'Todos los métodos' }, ...options]
})

// Computed para filtrar y ordenar los movimientos
const filteredAndSortedMoves = computed(() => {
  let moves = [...movesPokemon.value]
  const searchValue = searchTermDebounced.value?.toLowerCase()

  // Filtro por búsqueda
  if (searchValue) {
    moves = moves.filter(
      (move) =>
        move.name.toLowerCase().includes(searchValue) ||
        move.effect?.toLowerCase().includes(searchValue),
    )
  }

  // Filtro por tipo
  if (selectedType.value !== 'all') {
    moves = moves.filter((move) => move.type === selectedType.value)
  }

  // Filtro por categoría
  if (selectedCategory.value !== 'all') {
    moves = moves.filter((move) => move.category === selectedCategory.value)
  }

  // Filtro por método
  if (selectedMethod.value !== 'all') {
    moves = moves.filter((move) => move.learnMethod === selectedMethod.value)
  }

  // Ordenamiento por nivel (especial para level-up)
  if (sortBy.value === 'level') {
    return moves.sort((a, b) => {
      // Los movimientos que no tienen nivel (como MT, huevo, tutor) van al final
      const levelA =
        a.levelLearnedAt !== undefined && a.levelLearnedAt !== null ? a.levelLearnedAt : Infinity
      const levelB =
        b.levelLearnedAt !== undefined && b.levelLearnedAt !== null ? b.levelLearnedAt : Infinity
      return sortOrder.value === 'asc' ? levelA - levelB : levelB - levelA
    })
  }

  // Ordenamiento existente para otros campos
  if (sortBy.value && sortBy.value !== null) {
    return moves.sort((a, b) => {
      let aVal = a[sortBy.value]
      let bVal = b[sortBy.value]

      // Manejar valores nulos o indefinidos
      if (aVal === null || aVal === undefined || aVal === '-') {
        aVal = sortBy.value === 'name' ? 'zzz' : -Infinity
      }
      if (bVal === null || bVal === undefined || bVal === '-') {
        bVal = sortBy.value === 'name' ? 'zzz' : -Infinity
      }

      // Ordenamiento por nombre (alfabético)
      if (sortBy.value === 'name') {
        aVal = String(aVal).toLowerCase()
        bVal = String(bVal).toLowerCase()
        if (sortOrder.value === 'asc') {
          return aVal.localeCompare(bVal)
        } else {
          return bVal.localeCompare(aVal)
        }
      }

      // Ordenamiento por valores numéricos
      if (sortOrder.value === 'asc') {
        return aVal - bVal
      } else {
        return bVal - aVal
      }
    })
  }

  return moves
})

// Función para activar/desactivar el Easter Egg
const setupMikuEasterEgg = () => {
  if (isMikuEasterEggActive.value && !mikuComposable) {
    mikuComposable = useMiku()
    console.log('🎵 Easter Egg de Miku activado')
  } else if (!isMikuEasterEggActive.value && mikuComposable) {
    mikuComposable = null
    console.log('🎵 Easter Egg de Miku desactivado')
  }
}

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
  setupMikuEasterEgg()
})

// Watch para cambios en el Pokémon actual
watch(
  () => pokemon.value?.id,
  async () => {
    setupMikuEasterEgg()
    // Precargar nombres de habilidades
    if (normalAbilities.value?.length > 0 || hiddenAbility.value) {
      const allAbilities = [
        ...(normalAbilities.value || []),
        ...(hiddenAbility.value ? [hiddenAbility.value] : []),
      ]
      await preloadAbilityNames(allAbilities)
    }
  },
  { immediate: true },
)

// Lifecycle
onMounted(async () => {
  await loadPokemon(route.params.id)
  await nextTick()
  setupMikuEasterEgg()
  setupClickOutside()
})

onUnmounted(() => {
  const timeout = searchStore._debounceTimeout
  if (timeout) clearTimeout(timeout)
  mikuComposable = null
  cleanupClickOutside()
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

    <!-- Habilidades -->
    <div class="mt-4">
      <h2 class="text-lg font-semibold text-gray-700 mb-2">Habilidades</h2>
      <div class="flex flex-wrap items-center gap-2">
        <!-- Habilidades normales -->
        <button
          v-for="ability in normalAbilities"
          :key="ability.ability.name"
          @click.stop="toggleAbility(ability)"
          class="ability-button px-3 py-1 bg-gray-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-gray-700 hover:scale-105 transition-all duration-200 cursor-pointer"
          :class="{
            'ring-2 ring-blue-400 ring-offset-2': selectedAbility?.name === ability.ability.name,
          }"
        >
          {{ abilityNames[ability.ability.name] || formatName(ability.ability.name) }}
        </button>

        <!-- Habilidad oculta -->
        <button
          v-if="hiddenAbility"
          @click.stop="toggleAbility(hiddenAbility)"
          class="ability-button px-3 py-1 bg-amber-500 text-white text-sm font-medium rounded-full shadow-sm inline-flex items-center gap-1 hover:bg-amber-600 hover:scale-105 transition-all duration-200 cursor-pointer"
          :class="{
            'ring-2 ring-blue-400 ring-offset-2':
              selectedAbility?.name === hiddenAbility.ability.name,
          }"
          title="Habilidad Oculta"
        >
          ✨
          {{ abilityNames[hiddenAbility.ability.name] || formatName(hiddenAbility.ability.name) }}
        </button>

        <!-- Mensaje si no hay habilidad oculta -->
        <span
          v-else
          class="px-3 py-1 bg-gray-300 text-gray-500 text-sm font-medium rounded-full shadow-sm"
        >
          Sin habilidad oculta
        </span>
      </div>

      <!-- Descripción desplegada -->
      <div
        v-if="selectedAbility"
        class="ability-description mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm transition-all"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <h3 class="font-semibold text-gray-800">
              {{ selectedAbility.formattedName }}
              <span v-if="selectedAbility.isHidden" class="text-amber-600 text-sm ml-2"
                >✨ Oculta</span
              >
            </h3>
          </div>
          <button @click="selectedAbility = null" class="text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div v-if="loadingAbility === selectedAbility.name" class="text-center py-2">
          <div
            class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"
          ></div>
          <span class="text-sm text-gray-500 ml-2">Cargando descripción...</span>
        </div>
        <p v-else class="text-gray-600 text-sm leading-relaxed">
          {{ selectedAbility.description }}
        </p>
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
