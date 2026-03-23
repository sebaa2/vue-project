<!-- Details.vue - Versión Optimizada -->
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
import { formatPoke } from '../helpers/formatPoke.js'
import { formatTipos } from '../config/arrayTipo.js'
import notFound from '../assets/images/noFound.png'
import VirtualScroller from 'primevue/virtualscroller'
import physicalIcon from '../assets/categories/physical.png'
import specialIcon from '../assets/categories/special.png'
import statusIcon from '../assets/categories/status.png'

// Constantes y configuraciones
const CATEGORY_ICON = {
  physical: physicalIcon,
  special: specialIcon,
  status: statusIcon,
}

const CATEGORY_LABEL = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Estado',
}

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
  uniqueMoveTypes,
  uniqueCategories,
} = storeToRefs(pokemonStore)

const {
  searchTerm,
  searchTermDebounced,
  selectedType,
  selectedCategory,
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
  setSortBy,
  toggleSortOrder,
  resetFilters,
} = searchStore

// Estado local
const isBarChart = ref(true)
const isShiny = ref(false)
const activeForm = ref(null)
const expandedMove = ref(null)

// Computed
const isGigantamax = computed(() => pokemon.value?.name?.includes('-gmax') || false)

const tipoOptions = computed(() => [
  { value: 'all', label: 'Todos los tipos' },
  ...(uniqueMoveTypes.value.length ? uniqueMoveTypes.value : []),
])

const categoriaOptions = computed(() => [
  { value: 'all', label: 'Todas las categorías' },
  ...(uniqueCategories.value.length ? uniqueCategories.value : []),
])

const filteredAndSortedMoves = computed(() => {
  let moves = [...movesPokemon.value]
  const searchValue = searchTermDebounced.value?.toLowerCase()

  if (searchValue) {
    moves = moves.filter(
      (move) =>
        move.name.toLowerCase().includes(searchValue) ||
        move.effect?.toLowerCase().includes(searchValue),
    )
  }

  if (selectedType.value !== 'all') {
    moves = moves.filter((move) => move.type === selectedType.value)
  }

  if (selectedCategory.value !== 'all') {
    moves = moves.filter((move) => move.category === selectedCategory.value)
  }

  return moves.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (sortBy.value === 'name') {
      aVal = aVal?.toLowerCase() || ''
      bVal = bVal?.toLowerCase() || ''
    }

    return sortOrder.value === 'asc' ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1
  })
})

// Métodos
const changeChart = () => (isBarChart.value = !isBarChart.value)
const toggleShiny = () => (isShiny.value = !isShiny.value)
const toggleMoveDetails = (moveName) => {
  expandedMove.value = expandedMove.value === moveName ? null : moveName
}
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

// Watch
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

    <!-- Sección de movimientos -->
    <div v-if="!isGigantamax" class="mt-8">
      <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h2 class="text-2xl font-bold">Movimientos</h2>
        <div v-if="isSearchActive" class="text-sm text-gray-500">
          {{ filteredAndSortedMoves.length }} / {{ movesPokemon.length }} movimientos
          <button @click="resetFilters" class="ml-2 text-red-500 hover:text-red-700">
            ✕ Limpiar
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="mb-4 flex flex-wrap gap-2">
        <div class="relative">
          <input
            :value="searchTerm"
            @input="(e) => setSearchTerm(e.target.value)"
            type="text"
            placeholder="🔍 Buscar movimiento..."
            class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
          />
          <div v-if="isTyping" class="absolute right-2 top-1/2 transform -translate-y-1/2">
            <div
              class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        </div>

        <select
          :value="selectedType"
          @change="(e) => setSelectedType(e.target.value)"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option v-for="option in tipoOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>

        <select
          :value="selectedCategory"
          @change="(e) => setSelectedCategory(e.target.value)"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option v-for="option in categoriaOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Lista virtual de movimientos -->
      <VirtualScroller
        :items="filteredAndSortedMoves"
        :itemSize="70"
        :buffer="3"
        class="border border-gray-200 rounded-lg overflow-hidden"
        style="height: 500px"
      >
        <template #item="{ item, index }">
          <div
            v-memo="[item.name, expandedMove === item.name]"
            class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1 }"
          >
            <div class="flex items-center p-3 gap-2">
              <div class="w-24">
                <span
                  :class="formatTipos(item.type).color"
                  class="px-2 py-1 rounded-full text-white text-sm block text-center"
                >
                  {{ formatTipos(item.type).tipo }}
                </span>
              </div>

              <div class="w-28">
                <span
                  :class="{
                    'bg-red-500': item.category === 'physical',
                    'bg-blue-500': item.category === 'special',
                    'bg-green-500': item.category === 'status',
                  }"
                  class="px-2 py-1 rounded-full text-white inline-flex items-center gap-1 text-sm"
                >
                  <img
                    v-if="CATEGORY_ICON[item.category]"
                    :src="CATEGORY_ICON[item.category]"
                    :alt="item.category"
                    class="h-5 w-5"
                  />
                  {{ CATEGORY_LABEL[item.category] ?? item.category }}
                </span>
              </div>

              <div class="flex-1">
                <span class="font-medium text-gray-800">
                  {{ formatName(item.name) }}
                </span>
              </div>

              <div class="w-16 text-center text-gray-600">
                {{ item.power && item.power !== '-' ? item.power : '—' }}
              </div>

              <div class="w-16 text-center text-gray-600">
                {{ item.pp || '—' }}
              </div>

              <button
                @click="toggleMoveDetails(item.name)"
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
                :aria-label="expandedMove === item.name ? 'Ocultar detalles' : 'Mostrar detalles'"
              >
                <span class="text-gray-500">
                  {{ expandedMove === item.name ? '▲' : '▼' }}
                </span>
              </button>
            </div>

            <!-- Detalles expandidos -->
            <div v-if="expandedMove === item.name" class="px-3 pb-3">
              <div
                class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border-l-4 border-blue-400"
              >
                <p v-if="item.effect">
                  <span class="font-semibold">🎯 Efecto: </span>{{ item.effect }}
                </p>
                <p v-else class="italic text-gray-400">
                  Sin descripción disponible para este movimiento.
                </p>
                <div
                  v-if="item.accuracy || item.priority"
                  class="mt-2 flex gap-4 text-xs text-gray-500"
                >
                  <span v-if="item.accuracy">🎯 Precisión: {{ item.accuracy }}%</span>
                  <span v-if="item.priority && item.priority !== 0">
                    ⚡ Prioridad: {{ item.priority > 0 ? `+${item.priority}` : item.priority }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template #empty>
          <div class="flex items-center justify-center h-32 text-gray-500">
            No se encontraron movimientos.
            <button
              v-if="isSearchActive"
              @click="resetFilters"
              class="ml-2 text-blue-500 hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          </div>
        </template>
      </VirtualScroller>
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
