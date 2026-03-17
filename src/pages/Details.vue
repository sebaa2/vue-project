<script setup>
import { useRoute } from 'vue-router'
import { reactive, toRefs, computed, ref, onMounted, watch, nextTick } from 'vue'
import BarChar from '../components/BarChar.vue'
import RadarChar from '../components/RadarChar.vue'
import notFound from '../assets/images/no_found.png'
import { formatTipos } from '../config/arrayTipo.js'
import { columns } from '../config/configuracionTabla.js'
import { getPokemon } from '../helpers/getPokemon.js'
import { getSpecies } from '../helpers/getSpecies.js'
import { formatPoke } from '../helpers/formatPoke.js'
import {
  formatShowdownName,
  shouldUseShowdown,
  getShowdownSpritesWithFallback,
  CHERRIM_SUNSHINE_SPRITES,
} from '../helpers/showdownSprites.js'

import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net'
import 'datatables.net-responsive'
import 'datatables.net-responsive-dt/css/responsive.dataTables.css'
import { getMoves } from '../helpers/getMoves.js'
DataTable.use(DataTablesLib)

const state = reactive({
  pokemon: null,
  forms: [],
  stats: computed(() => filterStats()),
  types: computed(() => filterTypes()),
  formattedTypes: computed(() => filterTypes().map((type) => formatTipos(type))),
})
const movesPokemon = ref([])

// Estado para controlar si estamos usando fallback de Gen5
const useFallbackSprite = ref(false)

function filterStats() {
  if (state.pokemon) {
    return state.pokemon.stats.map((stat) => stat.base_stat)
  }
}

function filterTypes() {
  if (state.pokemon) {
    return state.pokemon.types.map((type) => type.type.name)
  }
}

const route = useRoute()
const { pokemon, stats, types, formattedTypes, moves } = toRefs(state)

// Manejador de error de imagen mejorado
const handleImageError = (e) => {
  const pokemonName = state.pokemon?.name

  if (!useFallbackSprite.value && pokemonName && shouldUseShowdown(pokemonName)) {
  
    console.log(`Sprite animado no disponible para ${pokemonName}, intentando con Home`)
    useFallbackSprite.value = true
  } else {

    e.target.src = notFound
    console.log('Error cargando sprite, usando imagen por defecto')
  }
}

// Computed para obtener el sprite actual según el estado de fallback
const currentSprite = computed(() => {
  if (!state.pokemon) return {}

  const sprites = {}
  const types = ['front_default', 'front_shiny', 'back_default', 'back_shiny']

  types.forEach((type) => {
    if (useFallbackSprite.value && state.pokemon._fallbackSprites) {
      sprites[type] = state.pokemon._fallbackSprites[type]
    } else {
      sprites[type] = state.pokemon.sprites[type]
    }
  })

  return sprites
})

const getData = async () => {
  let pokemonData = await getPokemon(route.params.id)

  // Resetear el estado de fallback
  useFallbackSprite.value = false

  // Aplicar sprites de Showdown al Pokémon base
  const pokemonName = pokemonData.name

  // Caso especial para Cherrim Sunshine
  if (pokemonName === 'cherrim-sunshine') {
    pokemonData.sprites = {
      ...pokemonData.sprites,
      ...CHERRIM_SUNSHINE_SPRITES,
    }
  }
  // Para Pokémon que deben usar Showdown (con fallback a Gen5)
  else if (shouldUseShowdown(pokemonName)) {
    // Guardamos ambos tipos de sprites
    const showdownSprites = getShowdownSpritesWithFallback(pokemonName)
    pokemonData.sprites = {
      ...pokemonData.sprites,
      ...showdownSprites.animated, // Por defecto usamos animados
    }
    // Guardamos los fallback para usarlos si es necesario
    pokemonData._fallbackSprites = showdownSprites.fallback
    console.log(`Sprites Showdown para: ${pokemonName}`, showdownSprites)
  }
  // Si no usa Showdown, mantenemos los sprites originales
  else {
    console.log('Manteniendo sprites originales para:', pokemonName)
  }

  state.pokemon = pokemonData
  console.log('state.pokemon', state.pokemon)

  state.forms = await getSpecies(route.params.id)
  console.log('state.forms', state.forms)

  movesPokemon.value = await getMoves(state.pokemon.moves)
}

watch(route, async () => {
  await getData()
  await nextTick()
})

onMounted(async () => {
  await getData()
  await nextTick()
})

//Cambio entre barra y radar
const isBarChart = ref(true)

const changeChart = () => {
  isBarChart.value = !isBarChart.value
}

//cambio de sprites
const isShiny = ref(false)

const toggleShiny = () => {
  isShiny.value = !isShiny.value
}

function formatName(name) {
  const parts = name.split('-')
  if (parts.length === 1) {
    return 'Base'
  }

  return parts
    .slice(1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const filteredForms = computed(() => {
  return state.forms.filter(
    (form) => !form.pokemon.name.includes('koraidon') && !form.pokemon.name.includes('miraidon'),
  )
})

const activeForm = ref(null)

const selectForm = async (form) => {
  const res = await fetch(form.pokemon.url)
  const data = await res.json()
  const pokemonName = form.pokemon.name

  // Resetear el estado de fallback
  useFallbackSprite.value = false

  // Caso especial para Cherrim Sunshine
  if (pokemonName === 'cherrim-sunshine') {
    data.sprites = {
      ...data.sprites,
      ...CHERRIM_SUNSHINE_SPRITES,
    }
  }
  // Showdown para todos (con fallback a Gen5)
  else if (shouldUseShowdown(pokemonName)) {
    const showdownSprites = getShowdownSpritesWithFallback(pokemonName)
    data.sprites = {
      ...data.sprites,
      ...showdownSprites.animated,
    }
    data._fallbackSprites = showdownSprites.fallback
    console.log(`Sprites Showdown para forma: ${pokemonName}`, showdownSprites)
  }
  // sprites originales
  else {
    console.log('Manteniendo sprites originales para forma:', pokemonName)
  }

  state.pokemon = data
  activeForm.value = pokemonName
  console.log('activeForm.value', activeForm.value)
}
</script>

<template>
  <div v-if="pokemon">
    <div class="w-full max-w-6xl mx-auto rounded-xl p-6 md:p-10 shadow-lg">
      <h1 class="front-black md:text-3x1 text-xl text-red-900 mb-2">
        {{ formatPoke(pokemon.name) }}
      </h1>

      <span
        v-for="tipo in formattedTypes"
        :key="tipo.tipo"
        :class="tipo.color"
        class="py-1 px-3 shadow-md rounded-full text-white front-semibold mr-1 mt-3"
      >
        {{ tipo.tipo }}
      </span>

      <!-- BOTON SHINY -->
      <div class="mt-4 flex items-center gap-4">
        <button
          @click="toggleShiny"
          :class="
            isShiny
              ? 'bg-purple-500 text-white'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
          "
          class="px-4 py-2 rounded-lg shadow-md font-semibold hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {{ isShiny ? 'Normal' : 'Shiny' }}
        </button>
      </div>

      <!-- ================= SPRITES ================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 place-items-center gap-1">
        <div class="text-center">
          <img
            class="w-48 h-48"
            :src="isShiny ? currentSprite.front_shiny : currentSprite.front_default"
            @error="handleImageError"
          />
          <p class="text-sm text-gray-600 mt-2">Frente</p>
        </div>

        <div class="text-center">
          <img
            class="w-48 h-48"
            :src="isShiny ? currentSprite.back_shiny : currentSprite.back_default"
            @error="handleImageError"
          />
          <p class="text-sm text-gray-600 mt-2">Espalda</p>
        </div>
      </div>

      <!-- Mensaje indicando que se está usando sprite alternativo -->
      <div v-if="useFallbackSprite" class="text-center mt-2">
        <p class="text-xs text-gray-500">Usando sprite estático (GIF no disponible)</p>
      </div>

      <!-- FORMAS -->
      <div v-if="state.forms.length > 1" class="mt-4 text-center">
        <h2 class="text-lg sm:text-x1 md:text-2x1 font-bold">Formas</h2>

        <div class="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3 mt-2">
          <button
            v-for="form in filteredForms"
            :key="form.pokemon.name"
            @click="selectForm(form)"
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

      <!-- ================= STATS ================= -->
      <div class="mt-8">
        <button
          @click="changeChart()"
          class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mb-4"
        >
          {{ isBarChart ? 'Radar' : 'Bar' }}
        </button>
        <div
          v-if="formattedTypes.length"
          :class="[formattedTypes[0].color, { 'flex justify-center items-center': !isBarChart }]"
          class="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto rounded shadow-lg"
        >
          <component :is="isBarChart ? BarChar : RadarChar" :stats="stats" />
        </div>
      </div>

      <!-- ================= MOVIMIENTOS ================= -->
      <div class="mt-8">
        <h2 class="text-2xl font-bold mb-4">Movimientos</h2>

        <div class="w-full overflow-x-auto rounded-lg">
          <DataTable :columns="columns" :data="movesPokemon" />
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Cargando...</p>
  </div>
</template>
