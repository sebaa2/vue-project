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

  state.forms = await getSpecies(route.params.id)

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
</script>

<template>
  <div v-if="pokemon">
    <div class="w-full max-w-6xl mx-auto rounded-xl p-6 md:p-10 shadow-lg">
      <h1 class="front-black md:text-3x1 text-xl text-red-900 mb-2">
        {{ pokemon.name }}
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
          @click="toggleShiny()"
          class="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200"
        >
          {{ isShiny ? 'Normal' : 'Shiny' }}
        </button>
      </div>

      <!-- ================= SPRITES ================= -->
      <div class="flex flex-col md:flex-row">
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
      <div class="mt-4 text-center">
        <h2 class="text-lg sm:text-x1 md:text-2x1 font-bold">Formas</h2>

        <div class="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3 mt-2">
          <button
            v-for="form in state.forms"
            :key="form.pokemon.name"
            @click="loadForm(form.pokemon.url)"
            class="px-2 py-1 text-xs sm: px-3 sm:py-1.5 sm:text-sm md:px-4 md:py-2 md:text-sm bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg shadow-md sm:shadow-md hover:from-blue-500 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            {{ form.pokemon.name }}
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

        <component :is="isBarChart ? BarChar : RadarChar" :stats="stats" />
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
