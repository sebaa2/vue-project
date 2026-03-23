<template>
  <header class="bg-red-700 text-white mb-4 py-8 px-6 relative">
    <h1 class="text-3xl font-bold text-center">Pokemon + Vite</h1>

    <!-- Mostrar la barra de búsqueda solo si NO está en home -->
    <div v-if="!isHomeRoute" class="flex gap-4 justify-center mt-4">
      <div class="w-96 relative">
        <!-- INPUT DE BÚSQUEDA -->
        <div class="relative">
          <input
            ref="inputRef"
            type="text"
            :value="searchTerm"
            @input="handleSearchInput"
            @focus="showList = true"
            @blur="hideList"
            placeholder="Buscar Pokémon..."
            class="w-full pl-10 pr-10 py-2.5 bg-white text-gray-800 border border-gray-400 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>

          <div v-if="isTyping" class="absolute right-3 top-1/2 -translate-y-1/2">
            <div
              class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"
            ></div>
          </div>

          <button
            v-if="searchTerm && !isTyping"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <!-- CONTENEDOR PARA LA LISTA -->
        <div
          v-if="showList && !isLoading && filteredPokemons.length > 0"
          class="absolute z-50 w-full mt-1"
          style="top: 100%; left: 0"
        >
          <VirtualScroller
            :items="filteredPokemons"
            :itemSize="48"
            :buffer="10"
            :style="{ height: getListHeight() + 'px' }"
            class="bg-white border rounded-lg shadow-lg overflow-hidden"
          >
            <template #item="{ item }">
              <router-link
                :to="`/details/${item.index}`"
                class="flex items-center gap-2 p-2 hover:bg-red-50 transition-colors block"
                @click="showList = false"
              >
                <span class="text-sm font-normal text-gray-500 min-w-[50px]">
                  #{{ String(item.index).padStart(3, '0') }}
                </span>
                <span class="text-gray-800 hover:text-red-600">
                  {{ formatPoke(item.name) }}
                </span>
              </router-link>
            </template>
          </VirtualScroller>
        </div>

        <!-- BARRA DE PROGRESO -->
        <div v-if="isLoading" class="absolute z-50 w-full mt-1" style="top: 100%; left: 0">
          <div class="bg-white border rounded-lg shadow-lg p-3">
            <div class="text-sm text-gray-600 mb-1">Cargando Pokémon... {{ loadingProgress }}%</div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-500 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${loadingProgress}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- MENSAJE SIN RESULTADOS -->
        <div
          v-if="showList && !isLoading && filteredPokemons.length === 0 && searchTerm"
          class="absolute z-50 w-full mt-1"
          style="top: 100%; left: 0"
        >
          <div class="bg-white border rounded-lg shadow-lg text-gray-500 p-4 text-center">
            No se encontraron Pokémon para "{{ searchTerm }}"
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import VirtualScroller from 'primevue/virtualscroller'
import { getSearchPoke } from '../helpers/getSearchPoke'
import { formatPoke } from '../helpers/formatPoke'

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
// Detectar si está en la ruta home
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
  const itemHeight = 48
  const maxHeight = 400
  const minHeight = 48

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

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
