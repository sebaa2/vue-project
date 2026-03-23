<!-- Home.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-red-50 to-white">
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl md:text-5xl font-black text-red-800 mb-2">Pokédex</h1>
        <p class="text-gray-600 text-lg">Explora los 1025 Pokémon</p>
      </div>

      <div v-if="mostVisitedPokemon" class="mb-8">
        <div
          class="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-md p-4 border border-yellow-200"
        >
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div class="flex items-center gap-4">
              <div class="text-4xl">🏆</div>
              <div>
                <h3 class="text-sm font-semibold text-yellow-700 uppercase tracking-wide">
                  Pokémon más buscado
                </h3>
                <div class="flex items-center gap-3 mt-1">
                  <img
                    :src="mostVisitedPokemon.sprite"
                    :alt="mostVisitedPokemon.name"
                    class="w-12 h-12 object-contain"
                    @error="(e) => (e.target.src = notFound)"
                  />
                  <div>
                    <p class="text-xl font-bold text-gray-800 capitalize">
                      {{ formatName(mostVisitedPokemon.name) }}
                    </p>
                    <p class="text-sm text-gray-500">
                      Visitado {{ mostVisitedPokemon.count }} veces
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <router-link
              :to="`/details/${mostVisitedPokemon.id}`"
              class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-semibold"
            >
              Ver Pokémon →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Barra de búsqueda y filtros -->
      <div class="bg-white rounded-xl shadow-md p-4 mb-8">
        <div class="flex flex-col gap-4">
          <!-- Fila 1: Búsqueda -->
          <div class="flex flex-col md:flex-row gap-4">
            <div class="flex-1 relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="🔍 Buscar Pokémon por nombre o número..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                @keyup.enter="performSearch"
              />
              <button
                v-if="searchQuery"
                @click="clearSearch"
                class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <button
              @click="performSearch"
              class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Buscar
            </button>
          </div>

          <!-- Fila 2: Filtros (Tipo 1, Tipo 2, Generación) -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Filtro Tipo Principal -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Tipo Principal </label>
              <select
                v-model="selectedPrimaryType"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">Todos los tipos</option>
                <option v-for="type in pokemonTypes" :key="type" :value="type">
                  {{ formatTipo(type) }}
                </option>
              </select>
            </div>

            <!-- Filtro Tipo Secundario -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Tipo Secundario </label>
              <select
                v-model="selectedSecondaryType"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="none">Sin segundo tipo</option>
                <option v-for="type in pokemonTypes" :key="type" :value="type">
                  {{ formatTipo(type) }}
                </option>
              </select>
            </div>

            <!-- Filtro Generación  -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"> Generación </label>
              <select
                v-model="selectedGeneration"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
              >
                <option value="all">Todas las generaciones</option>
                <option v-for="gen in generationOptions" :key="gen.id" :value="gen.id">
                  {{ gen.name }} ({{ gen.range[0] }}-{{ gen.range[1] }})
                </option>
              </select>
            </div>
          </div>

          <!-- Filtro de  megas -->
          <div class="flex items-end">
            <label class="flex items-center gap-2 cursor-pointer pb-2">
              <input
                type="checkbox"
                v-model="showOnlyMegas"
                class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
              />
              <span class="text-sm font-medium text-gray-700">Mostrar solo Mega Evoluciones</span>
            </label>
          </div>

          <!-- Fila 3: Botón de limpiar filtros y contador -->
          <div class="flex justify-between items-center">
            <button
              @click="resetAllFilters"
              class="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              🗑️ Limpiar todos los filtros
            </button>

            <div class="text-sm text-gray-500">{{ totalResults }} Pokémon encontrados</div>
          </div>

          <!-- Indicadores de filtros activos -->
          <div v-if="hasActiveFilters" class="flex flex-wrap gap-2">
            <span class="text-xs text-gray-500">Filtros activos:</span>
            <span
              v-if="searchQuery"
              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              🔍 {{ searchQuery }}
            </span>
            <span
              v-if="selectedPrimaryType !== 'all'"
              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              📌 Tipo: {{ formatTipo(selectedPrimaryType) }}
            </span>
            <span
              v-if="selectedSecondaryType !== 'all'"
              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              🔹 Tipo 2:
              {{
                selectedSecondaryType === 'none'
                  ? 'Sin segundo tipo'
                  : formatTipo(selectedSecondaryType)
              }}
            </span>
            <span
              v-if="selectedGeneration !== 'all'"
              class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
            >
              📅 {{ getGenerationName(selectedGeneration) }}
            </span>
            <span
              v-if="showOnlyMegas"
              class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
            >
              ⚡ Solo Megas
            </span>
          </div>
        </div>

        <!-- Indicador de carga de la lista -->
        <div v-if="isLoading && loadProgress < 100" class="mt-4">
          <div class="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>Cargando Pokédex...</span>
            <span>{{ loadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-red-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${loadProgress}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Loading State de la cuadrícula -->
      <div
        v-if="isLoading && paginatedPokemons.length === 0"
        class="flex justify-center items-center py-20"
      >
        <div
          class="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent"
        ></div>
      </div>

      <!-- Grid de Pokémon -->
      <div
        v-else-if="paginatedPokemons.length > 0"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <router-link
          v-for="pokemon in paginatedPokemons"
          :key="pokemon.id"
          :to="`/details/${pokemon.id}`"
          class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer"
        >
          <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <img
              :src="pokemon.image || pokemon.sprites?.front_default"
              :alt="pokemon.name"
              class="w-full h-32 object-contain group-hover:scale-110 transition-transform duration-300"
              @error="handleImageError"
            />
            <span class="absolute top-2 left-2 text-xs text-gray-400 font-mono">
              #{{ String(pokemon.id).padStart(4, '0') }}
            </span>
            <!-- Badge de generación -->
            <span
              class="absolute top-2 right-2 text-xs bg-gray-800 text-white px-1.5 py-0.5 rounded-full"
            >
              Gen {{ getPokemonGeneration(pokemon.id) }}
            </span>
          </div>
          <div class="p-3">
            <h3 class="font-bold text-gray-800 text-center capitalize">
              {{ formatName(pokemon.name) }}
            </h3>
            <div class="flex flex-wrap justify-center gap-1 mt-2">
              <span
                :class="getTypeColor(pokemon.primaryType)"
                class="px-2 py-0.5 rounded-full text-white text-xs"
              >
                {{ formatTipo(pokemon.primaryType) }}
              </span>
              <span
                v-if="pokemon.secondaryType"
                :class="getTypeColor(pokemon.secondaryType)"
                class="px-2 py-0.5 rounded-full text-white text-xs"
              >
                {{ formatTipo(pokemon.secondaryType) }}
              </span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold text-gray-600 mb-2">No se encontraron Pokémon</h3>
        <p class="text-gray-400">Intenta con otra búsqueda o revisa los filtros</p>
        <button
          @click="resetAllFilters"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="mt-8 flex flex-wrap justify-center gap-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        <div class="flex gap-1 flex-wrap justify-center">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-2 rounded-lg border transition-colors',
              currentPage === page
                ? 'bg-red-600 text-white border-red-600'
                : 'border-gray-300 hover:bg-gray-100',
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>

      <!-- Selector de items por página -->
      <div class="mt-4 flex justify-center">
        <select
          v-model="itemsPerPage"
          class="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option :value="12">12 por página</option>
          <option :value="24">24 por página</option>
          <option :value="48">48 por página</option>
          <option :value="96">96 por página</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonListStore } from '../stores/pokemonListStore.js'
import { formatTipos } from '../config/arrayTipo.js'
import notFound from '../assets/images/no_found.png'
import { useHistoryStore } from '../stores/historyStore.js'

const pokemonListStore = usePokemonListStore()
const historyStore = useHistoryStore()

// Estados locales
const searchQuery = ref('')
const selectedPrimaryType = ref('all')
const selectedSecondaryType = ref('all')
const selectedGeneration = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(24)
const showOnlyMegas = ref(false)

// Obtener datos del store
const { pokemons, isLoading, loadProgress, allPokemons } = storeToRefs(pokemonListStore)
const { mostVisitedPokemon } = storeToRefs(historyStore)

// Definir las generaciones directamente en el componente
const generationOptions = [
  { id: 1, name: 'Generación I', range: [1, 151] },
  { id: 2, name: 'Generación II', range: [152, 251] },
  { id: 3, name: 'Generación III', range: [252, 386] },
  { id: 4, name: 'Generación IV', range: [387, 493] },
  { id: 5, name: 'Generación V', range: [494, 649] },
  { id: 6, name: 'Generación VI', range: [650, 721] },
  { id: 7, name: 'Generación VII', range: [722, 809] },
  { id: 8, name: 'Generación VIII', range: [810, 898] },
  { id: 9, name: 'Generación IX', range: [899, 1025] },
]

// Tipos de Pokémon disponibles
const pokemonTypes = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
]

// Función para obtener generación por ID
const getPokemonGeneration = (id) => {
  if (id >= 1 && id <= 151) return 1
  if (id >= 152 && id <= 251) return 2
  if (id >= 252 && id <= 386) return 3
  if (id >= 387 && id <= 493) return 4
  if (id >= 494 && id <= 649) return 5
  if (id >= 650 && id <= 721) return 6
  if (id >= 722 && id <= 809) return 7
  if (id >= 810 && id <= 898) return 8
  if (id >= 899 && id <= 1025) return 9
  return null
}

// Función para obtener nombre de generación
const getGenerationName = (genId) => {
  const gen = generationOptions.find((g) => g.id === parseInt(genId))
  return gen ? gen.name : `Gen ${genId}`
}

// Función para identificar si un Pokémon es una Mega Evolución
const isMegaPokemon = (name) => {
  const lowerName = name.toLowerCase()

  // Las Mega Evoluciones SIEMPRE tienen "-mega" en el nombre
  // y NO son Meganium, Yanmega, etc.
  if (!lowerName.includes('mega')) {
    return false
  }

  // Excepciones: Pokémon que tienen "mega" pero NO son Mega Evoluciones
  const exceptions = ['meganium', 'yanmega']

  // Verificar si es una excepción
  if (exceptions.includes(lowerName)) {
    return false
  }

  // Si tiene "-mega" y no es excepción, es Mega Evolución
  return lowerName.includes('-mega')
}

// Verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value !== '' ||
    selectedPrimaryType.value !== 'all' ||
    selectedSecondaryType.value !== 'all' ||
    selectedGeneration.value !== 'all' ||
    showOnlyMegas.value
  )
})

// Pokémon filtrados por todos los criterios
const filteredPokemons = computed(() => {
  let filtered = allPokemons.value || pokemons.value || []

  // Filtrar por búsqueda (nombre o número)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(query) || pokemon.id.toString().includes(query),
    )
  }

  // Filtrar por tipo principal
  if (selectedPrimaryType.value !== 'all') {
    filtered = filtered.filter((pokemon) => pokemon.primaryType === selectedPrimaryType.value)
  }

  // Filtrar por tipo secundario
  if (selectedSecondaryType.value !== 'all') {
    if (selectedSecondaryType.value === 'none') {
      filtered = filtered.filter((pokemon) => !pokemon.secondaryType)
    } else {
      filtered = filtered.filter((pokemon) => pokemon.secondaryType === selectedSecondaryType.value)
    }
  }

  // Filtrar por generación
  if (selectedGeneration.value !== 'all') {
    const genId = parseInt(selectedGeneration.value)
    const gen = generationOptions.find((g) => g.id === genId)

    if (gen) {
      filtered = filtered.filter(
        (pokemon) => pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1],
      )
    }
  }

  // Filtrar por Megas (checkbox)
  if (showOnlyMegas.value) {
    filtered = filtered.filter((pokemon) => isMegaPokemon(pokemon.name))
  }

  return filtered
})

// Paginación
const totalResults = computed(() => filteredPokemons.value.length)
const totalPages = computed(() => Math.ceil(totalResults.value / itemsPerPage.value))
const paginatedPokemons = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPokemons.value.slice(start, end)
})

// Páginas visibles para la paginación
const visiblePages = computed(() => {
  const delta = 2
  const range = []
  const rangeWithDots = []
  let l

  for (let i = 1; i <= totalPages.value; i++) {
    if (
      i === 1 ||
      i === totalPages.value ||
      (i >= currentPage.value - delta && i <= currentPage.value + delta)
    ) {
      range.push(i)
    }
  }

  range.forEach((i) => {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  })

  return rangeWithDots
})

// Funciones
const formatName = (name) => {
  return name.split('-')[0].charAt(0).toUpperCase() + name.split('-')[0].slice(1)
}

const formatTipo = (tipo) => {
  const tiposMap = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada',
  }
  return tiposMap[tipo] || tipo
}

const getTypeColor = (type) => {
  const colors = {
    normal: 'bg-gray-500',
    fire: 'bg-red-600',
    water: 'bg-blue-600',
    electric: 'bg-yellow-500',
    grass: 'bg-green-600',
    ice: 'bg-cyan-500',
    fighting: 'bg-orange-700',
    poison: 'bg-purple-700',
    ground: 'bg-yellow-700',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-600',
    bug: 'bg-lime-600',
    rock: 'bg-stone-600',
    ghost: 'bg-purple-800',
    dragon: 'bg-indigo-800',
    dark: 'bg-gray-800',
    steel: 'bg-gray-600',
    fairy: 'bg-pink-400',
  }
  return colors[type] || 'bg-gray-500'
}

const performSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  performSearch()
}

const resetAllFilters = () => {
  searchQuery.value = ''
  selectedPrimaryType.value = 'all'
  selectedSecondaryType.value = 'all'
  selectedGeneration.value = 'all'
  showOnlyMegas.value = false
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const handleImageError = (e) => {
  e.target.src = notFound
}

// Watch para resetear página cuando cambian los filtros
watch(
  [
    searchQuery,
    selectedPrimaryType,
    selectedSecondaryType,
    selectedGeneration,
    showOnlyMegas,
    itemsPerPage,
  ],
  () => {
    currentPage.value = 1
  },
)

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
}
</style>
