<!-- Details.vue -->
<script setup>
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonStore } from '../stores/pokemonStore.js'
import { useSearchStore } from '../stores/searchStore.js'
import { useEasterEggStore } from '../stores/EastereggStore.js'
import BarChar from '../components/BarChar.vue'
import RadarChar from '../components/RadarChar.vue'
import EvolutionChain from '../components/EvolutionChain.vue'
import EeveeEvolutions from '../components/EeveeEvolutions.vue'
import { formatPoke } from '../helpers/formatPoke.js'
import { formatTipos } from '../config/arrayTipo.js'
import notFound from '../assets/images/noFound.png'

// PrimeVue
import VirtualScroller from 'primevue/virtualscroller'

import physicalIcon from '../assets/categories/physical.png'
import specialIcon from '../assets/categories/special.png'
import statusIcon from '../assets/categories/status.png'

const route = useRoute()
const router = useRouter()
const pokemonStore = usePokemonStore()
const searchStore = useSearchStore()
const easterEggStore = useEasterEggStore()

const categoryIcon = {
  physical: physicalIcon,
  special: specialIcon,
  status: statusIcon,
}

const categoryLabel = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Estado',
}

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
  currentPage,
  itemsPerPage,
  isSearchActive,
  isTyping,
} = storeToRefs(searchStore)

const { loadPokemon, selectForm, goToEvolution, handleImageError } = pokemonStore

const {
  setSearchTerm,
  setSelectedType,
  setSelectedCategory,
  setSortBy,
  toggleSortOrder,
  setCurrentPage,
  setItemsPerPage,
  resetFilters,
  clearSearch,
} = searchStore

// UI local
const isBarChart = ref(true)
const isShiny = ref(false)
const activeForm = ref(null)
const expandedMove = ref(null)

// Función para navegar al home
const goToHome = () => {
  router.push('/')
}

// Computed para detectar si es una forma Gigantamax
const isGigantamax = computed(() => {
  return pokemon.value?.name?.includes('-gmax') || false
})

// Computed para opciones de tipos con nombres en español (para los filtros)
const tipoOptions = computed(() => {
  const options = [{ value: 'all', label: 'Todos los tipos' }]
  if (uniqueMoveTypes.value.length) {
    return [...options, ...uniqueMoveTypes.value]
  }
  return options
})

// Computed para opciones de categorías con nombres en español (para los filtros)
const categoriaOptions = computed(() => {
  const options = [{ value: 'all', label: 'Todas las categorías' }]
  if (uniqueCategories.value.length) {
    return [...options, ...uniqueCategories.value]
  }
  return options
})

// Computed para movimientos filtrados y ordenados
const filteredAndSortedMoves = computed(() => {
  let moves = [...movesPokemon.value]

  const searchValue = searchTermDebounced.value

  if (searchValue) {
    const term = searchValue.toLowerCase()
    moves = moves.filter(
      (move) =>
        move.name.toLowerCase().includes(term) ||
        (move.effect && move.effect.toLowerCase().includes(term)),
    )
  }

  if (selectedType.value !== 'all') {
    moves = moves.filter((move) => move.type === selectedType.value)
  }

  if (selectedCategory.value !== 'all') {
    moves = moves.filter((move) => move.category === selectedCategory.value)
  }

  moves.sort((a, b) => {
    let aVal = a[sortBy.value]
    let bVal = b[sortBy.value]

    if (sortBy.value === 'name') {
      aVal = aVal?.toLowerCase() || ''
      bVal = bVal?.toLowerCase() || ''
    }

    if (sortOrder.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })

  return moves
})

const changeChart = () => (isBarChart.value = !isBarChart.value)
const toggleShiny = () => (isShiny.value = !isShiny.value)
const toggleMoveDetails = (moveName) => {
  expandedMove.value = expandedMove.value === moveName ? null : moveName
}

const handleHiddenButtonClick = () => {
  easterEggStore.triggerSilla()
}

const handleSelectForm = async (form) => {
  activeForm.value = form.pokemon.name
  await selectForm(form)
  resetFilters()
}

function formatName(name) {
  const parts = name.split('-')
  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)
  if (parts.length === 1) return capitalize(parts[0])
  return parts.slice(1).map(capitalize).join(' ')
}

const EEVEE_FAMILY = [
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
]

watch(route, async () => {
  await loadPokemon(route.params.id)
  resetFilters()
  await nextTick()
})

onMounted(async () => {
  await loadPokemon(route.params.id)
  await nextTick()
})

onUnmounted(() => {
  if (searchStore._debounceTimeout) {
    clearTimeout(searchStore._debounceTimeout)
  }
})
</script>

<template>
  <div v-if="isLoading" class="min-h-screen" />

  <div v-else-if="pokemon">
    <div class="w-full max-w-6xl mx-auto rounded-xl p-6 md:p-10 shadow-lg">
      <!-- Botón de volver al inicio -->
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
        {{ formatPoke(pokemon.name) }}
      </h1>

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
          >
            <span
              class="inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 shadow-md flex items-center justify-center"
              :class="isShiny ? 'translate-x-7' : 'translate-x-1'"
            >
              <span v-if="isShiny" class="text-xs">✨</span>
              <span v-else class="text-xs"></span>
            </span>
          </button>

          <span
            class="text-sm font-medium transition-colors duration-300"
            :class="isShiny ? 'text-purple-600' : 'text-gray-600'"
          >
            {{ isShiny ? 'Modo Shiny' : 'Modo Normal' }}
          </span>

          <button
            @click="handleHiddenButtonClick"
            class="hidden-button"
            style="
              position: absolute;
              right: -40px;
              top: 0;
              width: 40px;
              height: 40px;
              opacity: 0;
              cursor: pointer;
            "
            aria-label="Botón secreto"
          ></button>
        </div>
      </div>

      <br />

      <div class="grid grid-cols-1 sm:grid-cols-2 place-items-center gap-1">
        <div class="text-center">
          <img
            class="w-30"
            :src="isShiny ? currentSprite.front_shiny : currentSprite.front_default"
            @error="(e) => handleImageError(e, notFound)"
          />
          <p class="text-sm text-gray-600 mt-2">Frente</p>
        </div>
        <div class="text-center">
          <img
            class="w-30"
            :src="isShiny ? currentSprite.back_shiny : currentSprite.back_default"
            @error="(e) => handleImageError(e, notFound)"
          />
          <p class="text-sm text-gray-600 mt-2">Espalda</p>
        </div>
      </div>

      <div v-if="useFallbackSprite" class="text-center mt-2">
        <p class="text-xs text-gray-500">Usando sprite estático (GIF no disponible)</p>
      </div>

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

      <EeveeEvolutions
        :evolutions="evolutions"
        :current-pokemon="pokemon.name"
        :on-go-to-evolution="goToEvolution"
      />

      <EvolutionChain
        v-if="!EEVEE_FAMILY.includes(pokemon?.name)"
        :evolutions="evolutions"
        :current-pokemon="pokemon.name"
        :on-go-to-evolution="goToEvolution"
      />

      <div class="mt-8">
        <button
          @click="changeChart"
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        >
          {{ isBarChart ? 'Radar' : 'Bar' }}
        </button>
        <div
          v-if="formattedTypes.length"
          :class="[
            isBarChart ? formattedTypes[0].color : '',
            { 'flex justify-center items-center': !isBarChart },
          ]"
          class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto rounded shadow-lg"
        >
          <component :is="isBarChart ? BarChar : RadarChar" :stats="stats" />
        </div>
      </div>

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
              ></div>
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
                      v-if="categoryIcon[item.category]"
                      :src="categoryIcon[item.category]"
                      :alt="item.category"
                      class="h-5 w-5"
                    />
                    {{ categoryLabel[item.category] ?? item.category }}
                  </span>
                </div>

                <div class="flex-1">
                  <span class="font-medium text-gray-800">
                    {{ formatName(item.name) }}
                  </span>
                </div>

                <div class="w-16 text-center text-gray-600">
                  {{
                    item.power !== undefined && item.power !== null && item.power !== '-'
                      ? item.power
                      : '—'
                  }}
                </div>

                <div class="w-16 text-center text-gray-600">
                  {{ item.pp || '—' }}
                </div>

                <button
                  @click="toggleMoveDetails(item.name)"
                  class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
                >
                  <span class="text-gray-500">
                    {{ expandedMove === item.name ? '▲' : '▼' }}
                  </span>
                </button>
              </div>

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
                    <span v-if="item.priority && item.priority !== 0"
                      >⚡ Prioridad:
                      {{ item.priority > 0 ? `+${item.priority}` : item.priority }}</span
                    >
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
    </div>
  </div>

  <div v-else>
    <p>Cargando...</p>
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
