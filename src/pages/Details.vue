<!-- Details.vue - Versión con barra de carga unificada sin superposición -->
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonStore } from '../stores/pokemonStore.js'
import { useEasterEggStore } from '../stores/EastereggStore.js'
import { useAbilityModal } from '../composables/useAbilityModal.js'
import ScrollToTop from '../components/ScrollToTop.vue'
import BarChar from '../components/graficos/BarChar.vue'
import RadarChar from '../components/graficos/RadarChar.vue'
import EvolutionChain from '../components/EvolutionChain.vue'
import EeveeEvolutions from '../components/EeveeEvolutions.vue'
import MoveTable from '../components/moves/MoveTable.vue'
import { formatPoke } from '../helpers/formatPoke.js'
import { formatTipos, getTiposOptions, getCategoriasOptions } from '../config/arrayTipo.js'
import notFound from '../assets/images/noFound.png'

// ─── Constantes ────────────────────────────────────────────────────────────────
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
])

const MIKU_POKEMON_IDS = [83, 648]

const LEARNING_METHODS = {
  'level-up': 'Nivel',
  machine: 'MT/MO',
  egg: 'Huevo',
  tutor: 'Tutor',
}

const MEGA_SPECIAL_IDS = {
  'raichu-mega-x': 10304,
  'raichu-mega-y': 10305,
  'absol-mega-z': 10307,
  'lucario-mega-z': 10310,
}

// ─── Stores ───────────────────────────────────────────────────────────────────
const route = useRoute()
const router = useRouter()
const pokemonStore = usePokemonStore()
const easterEggStore = useEasterEggStore()

const {
  pokemon,
  evolutions,
  movesPokemon,
  stats,
  formattedTypes,
  filteredForms,
  normalAbilities,
  hiddenAbility,
} = storeToRefs(pokemonStore)

const { loadPokemon, selectForm, goToEvolution } = pokemonStore

// ─── Estado local para la barra de carga ───
const localLoading = ref(true)
const loadProgress = ref(0)

// ─── Modal de habilidades ─────────────────────────────────────────────────────
const {
  selectedAbility,
  loadingAbility,
  abilityNames,
  toggleAbility,
  preloadAbilityNames,
  setupClickOutside,
  cleanupClickOutside,
} = useAbilityModal()

// ─── Estado local ─────────────────────────────────────────────────────────────
const isBarChart = ref(true)
const isShiny = ref(false)
const activeForm = ref(null)
const mikuEnabled = ref(false)
let cleanupMiku = null

// ─── Computed ─────────────────────────────────────────────────────────────────
const isGigantamax = computed(() => pokemon.value?.name?.includes('-gmax') || false)
const isMikuEasterEggActive = computed(
  () => pokemon.value && MIKU_POKEMON_IDS.includes(pokemon.value.id),
)

// Computed para el gradiente del header usando estilos en línea
const headerGradientStyle = computed(() => {
  if (!formattedTypes.value?.length) {
    return 'linear-gradient(to right, #4b5563, #1f2937)'
  }
  
  // Mapeo de tipos a colores
  const typeColors = {
    grass: '#4ade80',
    fire: '#fb923c',
    water: '#60a5fa',
    bug: '#a3e635',
    normal: '#9ca3af',
    poison: '#a855f7',
    electric: '#facc15',
    ground: '#a16207',
    fairy: '#ec489a',
    fighting: '#991b1b',
    psychic: '#7e22ce',
    rock: '#78716c',
    ghost: '#6d28d9',
    ice: '#93c5fd',
    dragon: '#4338ca',
    steel: '#94a3b8',
    flying: '#818cf8',
    dark: '#1f2937',
  }
  
  // Obtener el tipo del Pokémon (en español)
  const primaryTypeName = formattedTypes.value[0]?.tipo?.toLowerCase()
  // Mapear nombre español a inglés para buscar en typeColors
  const typeMap = {
    'planta': 'grass',
    'fuego': 'fire',
    'agua': 'water',
    'bicho': 'bug',
    'normal': 'normal',
    'veneno': 'poison',
    'eléctrico': 'electric',
    'tierra': 'ground',
    'hada': 'fairy',
    'lucha': 'fighting',
    'psíquico': 'psychic',
    'roca': 'rock',
    'fantasma': 'ghost',
    'hielo': 'ice',
    'dragón': 'dragon',
    'acero': 'steel',
    'volador': 'flying',
    'siniestro': 'dark',
  }
  
  const primaryTypeKey = typeMap[primaryTypeName] || primaryTypeName
  const primaryColor = typeColors[primaryTypeKey] || '#4b5563'
  
  // Si tiene segundo tipo
  if (formattedTypes.value.length > 1) {
    const secondaryTypeName = formattedTypes.value[1]?.tipo?.toLowerCase()
    const secondaryTypeKey = typeMap[secondaryTypeName] || secondaryTypeName
    const secondaryColor = typeColors[secondaryTypeKey] || primaryColor
    return `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
  }
  
  // Un solo tipo
  return `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)`
})

// Opciones de filtro para MoveTable (dependen de los movimientos disponibles)
const tipoOptions = computed(() => {
  const uniqueTypes = [...new Set(movesPokemon.value.map((m) => m.type))]
  const allTypesOptions = getTiposOptions()
  const available = allTypesOptions.filter((o) => uniqueTypes.includes(o.value))
  return [{ value: 'all', label: 'Todos los tipos' }, ...available]
})

const categoriaOptions = computed(() => {
  const uniqueCats = [...new Set(movesPokemon.value.map((m) => m.category))]
  const allCatOpts = getCategoriasOptions()
  const available = allCatOpts.filter((o) => uniqueCats.includes(o.value))
  return [{ value: 'all', label: 'Todas las categorías' }, ...available]
})

const methodOptions = computed(() => {
  const uniqueMethods = [...new Set(movesPokemon.value.map((m) => m.learnMethod))]
  const options = uniqueMethods
    .filter((m) => LEARNING_METHODS[m])
    .map((m) => ({ value: m, label: LEARNING_METHODS[m] }))
  return [{ value: 'all', label: 'Todos los métodos' }, ...options]
})

// ─── Funciones de imagen ──────────────────────────────────────────────────────
const getArtworkId = (pokemonName, defaultId) => MEGA_SPECIAL_IDS[pokemonName] ?? defaultId

const getOfficialArtworkUrl = (pokemonName, pokemonId, isShinyValue = false) => {
  const artworkId = getArtworkId(pokemonName, pokemonId)
  if (!artworkId) return null
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isShinyValue ? 'shiny/' : ''}${artworkId}.png`
}

const getBasicSpriteUrl = (pokemonName, pokemonId, isShinyValue = false, isBack = false) => {
  const artworkId = getArtworkId(pokemonName, pokemonId)
  if (!artworkId) return null
  const backPath = isBack ? 'back/' : ''
  const shinyPath = isShinyValue ? 'shiny/' : ''
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${backPath}${shinyPath}${artworkId}.png`
}

const getSpriteUrl = (type, isShinyValue = false) => {
  if (!pokemon.value) return notFound
  const { name: pokemonName, id: pokemonId } = pokemon.value

  const showdownSprite = isShinyValue
    ? pokemon.value.sprites?.[type === 'front' ? 'front_shiny' : 'back_shiny']
    : pokemon.value.sprites?.[type === 'front' ? 'front_default' : 'back_default']

  if (showdownSprite && !showdownSprite.includes('undefined')) return showdownSprite

  const artworkUrl = getOfficialArtworkUrl(pokemonName, pokemonId, isShinyValue)
  if (artworkUrl) return artworkUrl

  const basicUrl = getBasicSpriteUrl(pokemonName, pokemonId, isShinyValue, type === 'back')
  if (basicUrl) return basicUrl

  return notFound
}

const frontSpriteUrl = computed(() => getSpriteUrl('front', isShiny.value))
const backSpriteUrl = computed(() => getSpriteUrl('back', isShiny.value))

const handleImageError = (event, type) => {
  const img = event.target
  if (!pokemon.value || img.src === notFound) return
  const { name: pokemonName, id: pokemonId } = pokemon.value
  let newUrl = null

  if (img.src.includes('showdown') || img.src.includes('play.pokemonshowdown')) {
    newUrl = getOfficialArtworkUrl(pokemonName, pokemonId, isShiny.value)
  } else if (img.src.includes('official-artwork')) {
    newUrl = getBasicSpriteUrl(pokemonName, pokemonId, isShiny.value, type === 'back')
  }

  if (newUrl) {
    img.src = newUrl
  } else {
    img.src = notFound
    img.classList.add('image-error')
  }
}

const handleFrontError = (event) => handleImageError(event, 'front')
const handleBackError = (event) => handleImageError(event, 'back')

// ─── Función de carga unificada (reemplaza el isLoading del store) ────────────
const loadPokemonWithProgress = async (pokemonId) => {
  // Activar loading local
  localLoading.value = true
  loadProgress.value = 0

  // Simular carga incremental
  const interval = setInterval(() => {
    if (loadProgress.value < 90) {
      // Incremento progresivo
      const increment = loadProgress.value < 30 ? 15 : loadProgress.value < 60 ? 8 : 3
      loadProgress.value = Math.min(loadProgress.value + increment, 90)
    }
  }, 50)

  try {
    // Cargar el Pokémon real (esto actualiza pokemon.value)
    await loadPokemon(pokemonId)

    // Completar el progreso
    loadProgress.value = 100

    // Pequeño delay para que se vea el 100%
    await new Promise((resolve) => setTimeout(resolve, 200))
  } catch (error) {
    console.error('Error loading Pokémon:', error)
    loadProgress.value = 100
    await new Promise((resolve) => setTimeout(resolve, 200))
  } finally {
    clearInterval(interval)
    // Desactivar loading local después de un pequeño delay
    setTimeout(() => {
      localLoading.value = false
    }, 100)
  }
}

// ─── Easter Egg ──────────────────────────────────────────────────────────
const setupMikuEasterEgg = () => {
  const shouldBeActive = isMikuEasterEggActive.value

  if (shouldBeActive && !mikuEnabled.value) {
    mikuEnabled.value = true
    const buffer = []
    const SECRET_WORD = 'miku'

    const handleKeyDown = (e) => {
      const active = document.activeElement
      if (
        active &&
        (active.tagName?.toLowerCase() === 'input' ||
          active.tagName?.toLowerCase() === 'textarea' ||
          active.isContentEditable)
      )
        return

      if (e.key.length !== 1 || !e.key.match(/[a-zA-Z]/)) {
        if (e.key === 'Escape' || e.key === 'Enter') buffer.length = 0
        return
      }

      buffer.push(e.key.toLowerCase())
      while (buffer.length > SECRET_WORD.length) buffer.shift()
      if (buffer.join('') === SECRET_WORD) {
        buffer.length = 0
        easterEggStore.triggerMiku()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    cleanupMiku = () => window.removeEventListener('keydown', handleKeyDown)
  } else if (!shouldBeActive && mikuEnabled.value) {
    if (cleanupMiku) cleanupMiku()
    cleanupMiku = null
    mikuEnabled.value = false
  }
}

// ─── Métodos ──────────────────────────────────────────────────────────────────
const changeChart = () => (isBarChart.value = !isBarChart.value)
const toggleShiny = () => (isShiny.value = !isShiny.value)
const goToHome = () => router.push('/')
const handleHiddenButtonClick = () => easterEggStore.triggerSilla()

const handleSelectForm = async (form) => {
  activeForm.value = form.pokemon.name
  // Usar la carga con progreso para cambiar de forma
  await loadPokemonWithProgress(form.pokemon.name)
  isShiny.value = false
}

const handleGoToEvolution = async (pokemonId) => {
  // Activar la barra de carga antes de navegar a la evolución
  await loadPokemonWithProgress(pokemonId)
  isShiny.value = false
}

const formatName = (name) => {
  const parts = name.split('-')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  return parts
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Watchers ─────────────────────────────────────────────────────────────────
watch(route, async () => {
  // Usar la carga con progreso cuando cambie la ruta
  await loadPokemonWithProgress(route.params.id)
  isShiny.value = false
  await nextTick()
  setupMikuEasterEgg()
})

watch(
  () => pokemon.value?.id,
  async () => {
    setupMikuEasterEgg()
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

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Usar la carga con progreso al montar el componente
  await loadPokemonWithProgress(route.params.id)
  await nextTick()
  setupMikuEasterEgg()
  setupClickOutside()
})

onUnmounted(() => {
  if (cleanupMiku) cleanupMiku()
  mikuEnabled.value = false
  cleanupClickOutside()
  // Resetear estados
  localLoading.value = true
  loadProgress.value = 0
})
</script>

<template>
  <!-- 🔴 ÚNICA BARRA DE CARGA - No hay superposición porque reemplazamos isLoading del store -->
  <div
    v-if="localLoading"
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
  >
    <div class="text-center">
      <h1 class="text-4xl md:text-5xl font-black text-red-800 mb-8">PokéVite</h1>

      <!-- Barra de progreso -->
      <div class="w-80 md:w-96 mb-4">
        <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Cargando Pokémon...</span>
          <span>{{ Math.round(loadProgress) }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            class="bg-red-600 h-2 rounded-full transition-all duration-300 ease-out"
            :style="{ width: `${loadProgress}%` }"
          ></div>
        </div>
      </div>

      <p class="text-gray-500 text-sm">Cargando información del Pokémon</p>
    </div>
  </div>

  <!-- Pokémon encontrado -->
  <div
    v-else-if="pokemon"
    class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8 px-4"
  >
    <div class="w-full max-w-6xl mx-auto">
      <!-- Botón volver -->
      <div class="mb-6">
        <button
          @click="goToHome"
          class="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-300 border border-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 group-hover:-translate-x-1 transition-transform"
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

      <!-- Tarjeta principal -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <!-- Header con gradiente usando estilos en línea -->
        <div class="relative overflow-hidden" :style="{ background: headerGradientStyle }">
          <div class="absolute inset-0 bg-black/20" />
          <div class="relative px-6 py-8 md:px-8 md:py-10">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 class="font-black text-3xl md:text-5xl text-white drop-shadow-lg mb-2">
                  {{ formatPoke(pokemon.name) }}
                </h1>
                <span
                  class="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-mono"
                >
                  #{{ String(pokemon.id).padStart(4, '0') }}
                </span>
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <span
                  v-for="tipo in formattedTypes"
                  :key="tipo.tipo"
                  :class="tipo.color"
                  class="px-4 py-2 rounded-full text-white font-semibold shadow-lg text-sm backdrop-blur-sm"
                >
                  {{ tipo.tipo }}
                </span>

                <!-- Toggle shiny -->
                <div
                  class="relative inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full"
                >
                  <button
                    @click="toggleShiny"
                    class="relative inline-flex items-center h-8 rounded-full w-14 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400"
                    :class="
                      isShiny ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gray-400'
                    "
                  >
                    <span
                      class="inline-block w-6 h-6 transform bg-white rounded-full transition-transform duration-300 shadow-md flex items-center justify-center"
                      :class="isShiny ? 'translate-x-7' : 'translate-x-1'"
                    >
                      <span v-if="isShiny" class="text-sm">✨</span>
                      <span v-else class="text-sm">⭐</span>
                    </span>
                  </button>
                  <span class="text-sm font-medium text-white">
                    {{ isShiny ? '✨ Shiny' : 'Normal' }}
                  </span>
                </div>

                <button
                  @click="handleHiddenButtonClick"
                  class="w-8 h-8 opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Botón secreto"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Contenido principal -->
        <div class="p-6 md:p-8">
          <!-- Sprites -->
          <div class="grid grid-cols-2 gap-6 mb-8">
            <div class="text-center group">
              <div
                class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <img
                  class="w-48 h-48 object-contain mx-auto transform group-hover:scale-110 transition-transform duration-300"
                  :src="frontSpriteUrl"
                  @error="handleFrontError"
                  :alt="`${formatPoke(pokemon.name)} frente ${isShiny ? 'shiny' : 'normal'}`"
                />
                <p class="text-sm text-gray-500 mt-3 font-medium">Vista frontal</p>
                <div v-if="isShiny" class="absolute top-2 right-2 text-2xl animate-pulse">✨</div>
              </div>
            </div>
            <div class="text-center group">
              <div
                class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
              >
                <img
                  class="w-48 h-48 object-contain mx-auto transform group-hover:scale-110 transition-transform duration-300"
                  :src="backSpriteUrl"
                  @error="handleBackError"
                  :alt="`${formatPoke(pokemon.name)} espalda ${isShiny ? 'shiny' : 'normal'}`"
                />
                <p class="text-sm text-gray-500 mt-3 font-medium">Vista trasera</p>
              </div>
            </div>
          </div>

          <!-- Habilidades -->
          <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                class="w-6 h-6 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Habilidades
            </h2>
            <div class="flex flex-wrap items-center gap-3">
              <button
                v-for="ability in normalAbilities"
                :key="ability.ability.name"
                @click.stop="toggleAbility(ability)"
                class="group px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                :class="{
                  'ring-2 ring-blue-400 ring-offset-2 shadow-lg':
                    selectedAbility?.name === ability.ability.name,
                }"
              >
                {{ abilityNames[ability.ability.name] || formatName(ability.ability.name) }}
              </button>

              <button
                v-if="hiddenAbility"
                @click.stop="toggleAbility(hiddenAbility)"
                class="group px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer inline-flex items-center gap-1"
                :class="{
                  'ring-2 ring-blue-400 ring-offset-2 shadow-lg':
                    selectedAbility?.name === hiddenAbility.ability.name,
                }"
              >
                ✨
                {{
                  abilityNames[hiddenAbility.ability.name] || formatName(hiddenAbility.ability.name)
                }}
              </button>
              <span
                v-else
                class="px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-xl"
                >Sin habilidad</span
              >
            </div>

            <!-- Descripción de habilidad -->
            <div
              v-if="selectedAbility"
              class="mt-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-md transition-all"
            >
              <div class="flex justify-between items-start mb-3">
                <div>
                  <h3 class="font-bold text-gray-800 text-lg">
                    {{ selectedAbility.formattedName }}
                    <span v-if="selectedAbility.isHidden" class="text-amber-600 text-sm ml-2"
                      >✨ Oculta</span
                    >
                  </h3>
                </div>
                <button
                  @click="selectedAbility = null"
                  class="text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full p-1 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div
                v-if="loadingAbility === selectedAbility.name"
                class="flex items-center gap-2 py-2"
              >
                <div
                  class="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"
                />
                <span class="text-sm text-gray-500">Cargando descripción...</span>
              </div>
              <p v-else class="text-gray-700 text-sm leading-relaxed">
                {{ selectedAbility.description }}
              </p>
            </div>
          </div>

          <!-- Formas alternativas -->
          <div v-if="filteredForms.length > 1" class="mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                class="w-6 h-6 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Formas Alternativas
            </h2>
            <div class="flex flex-wrap justify-center gap-3">
              <button
                v-for="form in filteredForms"
                :key="form.pokemon.name"
                @click="handleSelectForm(form)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-xl shadow-md transition-all duration-200',
                  activeForm === form.pokemon.name
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105 ring-2 ring-blue-400 shadow-lg'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 hover:scale-105',
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
            :on-go-to-evolution="handleGoToEvolution"
          />
          <EvolutionChain
            v-if="!EEVEE_FAMILY.has(pokemon?.name)"
            :evolutions="evolutions"
            :current-pokemon="pokemon.name"
            :on-go-to-evolution="handleGoToEvolution"
          />

          <!-- Estadísticas -->
          <div class="mt-8">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg
                  class="w-6 h-6 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Estadísticas Base
              </h2>
              <button
                @click="changeChart"
                class="group px-5 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <!-- Ícono que cambia según el estado -->
                <svg
                  v-if="isBarChart"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                {{ isBarChart ? 'Ver Radar' : 'Ver Barras' }}
              </button>
            </div>
            <div
              :class="[
                isBarChart ? 'bg-gradient-to-br from-gray-50 to-gray-100' : '',
                'w-full rounded-2xl shadow-lg p-6 border border-gray-200',
              ]"
            >
              <component :is="isBarChart ? BarChar : RadarChar" :stats="stats" />
            </div>
          </div>

          <!-- ── Tabla de movimientos ──────────────────────────────────────
               Se pasan todos los movimientos (movesPokemon) directamente.
               MoveTable maneja el filtrado internamente con DataTable.
               ──────────────────────────────────────────────────────────── -->
          <div v-if="!isGigantamax" class="mt-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg
                class="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.121 14.121L19 19m-7-7l4-4m0 0l-4-4m4 4H5"
                />
              </svg>
              Lista de Movimientos
            </h2>
            <MoveTable
              :moves="movesPokemon"
              :tipo-options="tipoOptions"
              :categoria-options="categoriaOptions"
              :method-options="methodOptions"
            />
          </div>

          <div v-else class="mt-8 text-center py-12 bg-gray-50 rounded-xl">
            <svg
              class="w-16 h-16 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <p class="text-gray-500 text-lg">Sin movimientos disponibles para formas Gigantamax</p>
          </div>
        </div>
      </div>

      <ScrollToTop />
    </div>
  </div>

  <!-- Pokémon no encontrado -->
  <div
    v-else
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100"
  >
    <div class="text-center">
      <div class="text-6xl mb-4">🔍</div>
      <p class="text-gray-500 text-lg">Pokémon no encontrado</p>
      <button
        @click="goToHome"
        class="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
      >
        Volver al inicio
      </button>
    </div>
  </div>
</template>

<style scoped>
.image-error {
  opacity: 0.7;
  object-fit: contain;
  filter: grayscale(0.3);
}

::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>