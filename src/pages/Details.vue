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

const getData = async () => {
  state.pokemon = await getPokemon(route.params.id)
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
const loadForm = async (url) => {
  const res = await fetch(url)
  const data = await res.json()
  state.pokemon = data
  await nextTick()
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

const paradoxPokemon = [
  'great-tusk',
  'scream-tail',
  'brute-bonnet',
  'flutter-mane',
  'slither-wing',
  'sandy-shocks',
  'roaring-moon',
  'walking-wake',
  'gouging-fire',
  'raging-bolt',
  'iron-treads',
  'iron-bundle',
  'iron-hands',
  'iron-jugulis',
  'iron-moth',
  'iron-thorns',
  'iron-valiant',
  'iron-leaves',
  'iron-boulder',
  'iron-crown',
]
function isParadoja(name) {
  return paradoxPokemon.includes(name)
}

function formatPoke(name) {
  if (isParadoja(name)) {
    return name
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  const baseName = name.split('-')[0]
  return baseName.charAt(0).toUpperCase() + baseName.slice(1)
}

const filteredForms = computed(() => {
  return state.forms.filter(
    (form) => !form.pokemon.name.includes('koraidon') && !form.pokemon.name.includes('miraidon'),
  )
})

const activeForm = ref(null)

function selectForm(form) {
  activeForm.value = form.pokemon.name
  loadForm(form.pokemon.url)
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
      <!--flex flex-row md:flex-row
      centrar los sprites en pantalla completa -->
      <!-- ================= SPRITES ================= -->
      <div class="grid grid-cols-1 sm:grid-cols-2 place-items-center gap-1">
        <div class="text-center">
          <img
            class="w-48 h-48"
            :src="
              isShiny
                ? pokemon.sprites.front_shiny || notFound
                : pokemon.sprites.front_default || notFound
            "
          />
          <p class="text-sm text-gray-600 mt-2">Frente</p>
        </div>

        <div class="text-center">
          <img
            class="w-48 h-48"
            :src="
              isShiny
                ? pokemon.sprites.back_shiny || notFound
                : pokemon.sprites.back_default || notFound
            "
          />
          <p class="text-sm text-gray-600 mt-2">Espalda</p>
        </div>
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
      <!--funciono
      el radar no funciona-->

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
