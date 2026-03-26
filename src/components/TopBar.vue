<template>
  <header class="bg-gradient-to-r from-red-700 to-red-800 text-white mb-4 py-6 px-6 shadow-lg">
    <div class="container mx-auto flex items-center justify-between gap-8">
      <!-- Logo y título (sin el ícono) -->
      <div class="flex items-center gap-3">
        <h1
          class="text-3xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent"
        >
          PokeVite
        </h1>
      </div>

      <!-- Mostrar la barra de búsqueda solo si NO está en home -->
      <div v-if="!isHomeRoute" class="relative w-96">
        <!-- INPUT DE BÚSQUEDA -->
        <div class="relative group">
          <input
            ref="inputRef"
            type="text"
            :value="searchTerm"
            @input="handleSearchInput"
            @focus="showList = true"
            @blur="hideList"
            placeholder="Buscar Pokémon..."
            class="w-full pl-12 pr-12 py-3 bg-white/95 backdrop-blur-sm text-gray-800 border-2 border-transparent rounded-2xl placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-300 transition-all duration-300 shadow-md hover:shadow-xl"
          />
          <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>

          <div v-if="isTyping" class="absolute right-4 top-1/2 -translate-y-1/2">
            <div
              class="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"
            ></div>
          </div>

          <button
            v-if="searchTerm && !isTyping"
            @click="clearSearch"
            class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors duration-200 text-xl"
          >
            ✕
          </button>
        </div>

        <!-- CONTENEDOR PARA LA LISTA DE RESULTADOS -->
        <div
          v-if="showList && !isLoading && filteredPokemons.length > 0"
          class="absolute z-50 w-full mt-2 animate-fadeIn"
          style="top: 100%; left: 0"
        >
          <div class="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
            <div class="max-h-96 overflow-y-auto">
              <VirtualScroller
                :items="filteredPokemons"
                :itemSize="56"
                :buffer="10"
                :style="{ height: getListHeight() + 'px' }"
                class="bg-white"
              >
                <template #item="{ item }">
                  <router-link
                    :to="`/details/${item.index}`"
                    class="flex items-center gap-3 px-4 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 group cursor-pointer"
                    @click="showList = false"
                  >
                    <span
                      class="text-sm font-mono font-semibold text-gray-400 min-w-[55px] group-hover:text-red-500 transition-colors"
                    >
                      #{{ String(item.index).padStart(3, '0') }}
                    </span>
                    <div class="flex items-center gap-2 flex-1">
                      <div
                        class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors"
                      >
                        <span class="text-sm">⚡</span>
                      </div>
                      <span
                        class="text-gray-700 font-medium group-hover:text-red-600 transition-colors capitalize"
                      >
                        {{ formatPoke(item.name) }}
                      </span>
                    </div>
                    <!-- Flecha eliminada -->
                  </router-link>
                </template>
              </VirtualScroller>
            </div>
          </div>
        </div>

        <!-- BARRA DE PROGRESO DE CARGA -->
        <div
          v-if="isLoading"
          class="absolute z-50 w-full mt-2 animate-fadeIn"
          style="top: 100%; left: 0"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
            <div class="flex items-center gap-3 mb-2">
              <div
                class="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"
              ></div>
              <div class="text-sm font-medium text-gray-700">Cargando Pokémon...</div>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${loadingProgress}%` }"
              ></div>
            </div>
            <div class="text-xs text-gray-500 mt-2 text-right">{{ loadingProgress }}%</div>
          </div>
        </div>

        <!-- MENSAJE SIN RESULTADOS -->
        <div
          v-if="showList && !isLoading && filteredPokemons.length === 0 && searchTerm"
          class="absolute z-50 w-full mt-2 animate-fadeIn"
          style="top: 100%; left: 0"
        >
          <div class="bg-white rounded-2xl shadow-2xl p-6 text-center border border-gray-100">
            <div class="text-4xl mb-2">😢</div>
            <div class="text-gray-500 font-medium">No se encontraron Pokémon para</div>
            <div class="text-red-500 font-bold mt-1">"{{ searchTerm }}"</div>
            <div class="text-xs text-gray-400 mt-3">Intenta con otro nombre</div>
          </div>
        </div>
      </div>

      <!-- Espacio vacío para mantener el equilibrio cuando no hay barra -->
      <div v-else class="w-96"></div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import VirtualScroller from 'primevue/virtualscroller'
import { getSearchPoke } from '../helpers/getSearchPoke'
import { formatPoke } from '../helpers/formatPoke'

// Props para recibir el Pokémon más visitado
const props = defineProps({
  mostVisitedPokemon: {
    type: Object,
    default: null,
  },
})

// ==================== ROUTE ====================
const route = useRoute()

// ==================== STATE ====================
const pokemons = ref([])
const isLoading = ref(true)
const loadingProgress = ref(0)
const searchTerm = ref('')
const searchTermDebounced = ref('')
const showList = ref(false)
const isTyping = ref(false)
const inputRef = ref(null)

let debounceTimeout = null

// ==================== GETTERS ====================
const isHomeRoute = computed(() => {
  return route.path === '/' || route.path === '/home'
})

const filteredPokemons = computed(() => {
  if (!searchTermDebounced.value) return pokemons.value

  const search = searchTermDebounced.value.toLowerCase()
  return pokemons.value.filter((pokemon) => {
    const pokemonName = pokemon.name.toLowerCase().replace(/-/g, ' ')
    return pokemonName.includes(search)
  })
})

// ==================== MÉTODOS ====================
const getListHeight = () => {
  const itemsCount = filteredPokemons.value.length
  const itemHeight = 56
  const maxHeight = 400
  const minHeight = 56

  const calculatedHeight = itemsCount * itemHeight

  if (calculatedHeight > maxHeight) return maxHeight
  if (calculatedHeight < minHeight) return minHeight
  return calculatedHeight
}

const handleSearchInput = (event) => {
  searchTerm.value = event.target.value
  isTyping.value = true
  showList.value = true

  if (debounceTimeout) clearTimeout(debounceTimeout)

  debounceTimeout = setTimeout(() => {
    searchTermDebounced.value = searchTerm.value
    isTyping.value = false
  }, 300)
}

const hideList = () => {
  setTimeout(() => {
    showList.value = false
  }, 200)
}

const clearSearch = () => {
  searchTerm.value = ''
  searchTermDebounced.value = ''
  isTyping.value = false
  if (debounceTimeout) clearTimeout(debounceTimeout)
}

// ==================== LIFECYCLE ====================
onMounted(async () => {
  isLoading.value = true

  try {
    pokemons.value = await getSearchPoke()
    loadingProgress.value = 100
  } catch (error) {
    console.error('Error cargando Pokémon:', error)
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
})
</script>

<style scoped>
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

/* Estilo personalizado para el scroll */
.max-h-96::-webkit-scrollbar {
  width: 6px;
}

.max-h-96::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.max-h-96::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.max-h-96::-webkit-scrollbar-thumb:hover {
  background: #f56565;
}
</style>
