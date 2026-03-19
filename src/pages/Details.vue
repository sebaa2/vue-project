<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted, watch, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { usePokemonStore } from '../stores/pokemonStore.js'
import BarChar from '../components/BarChar.vue'
import RadarChar from '../components/RadarChar.vue'
import EvolutionChain from '../components/EvolutionChain.vue'
import EeveeEvolutions from '../components/EeveeEvolutions.vue'
import { formatPoke } from '../helpers/formatPoke.js'
import { columns } from '../config/configuracionTabla.js'
import notFound from '../assets/images/no_found.png'

import DataTable from 'datatables.net-vue3'
import DataTablesLib from 'datatables.net'
import 'datatables.net-responsive'
import 'datatables.net-responsive-dt/css/responsive.dataTables.css'
DataTable.use(DataTablesLib)

const route = useRoute()
const store = usePokemonStore()

const {
  pokemon,
  forms,
  evolutions,
  movesPokemon,
  isLoading,
  useFallbackSprite,
  stats,
  formattedTypes,
  currentSprite,
  filteredForms,
} = storeToRefs(store)

const { loadPokemon, selectForm, goToEvolution, handleImageError } = store

// UI local (no necesitan estar en el store)
const isBarChart = ref(true)
const isShiny = ref(false)
const activeForm = ref(null)

const changeChart = () => (isBarChart.value = !isBarChart.value)
const toggleShiny = () => (isShiny.value = !isShiny.value)

const handleSelectForm = async (form) => {
  activeForm.value = form.pokemon.name
  await selectForm(form)
}

function formatName(name) {
  const parts = name.split('-')
  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)
  if (parts.length === 1) return capitalize(parts[0])
  return parts.slice(1).map(capitalize).join(' ')
}

const EEVEE_FAMILY = [
  'eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon',
  'leafeon', 'glaceon', 'sylveon', 'eevee-gmax', 'eevee-starter',
  'vaporeon-gmax', 'jolteon-gmax', 'flareon-gmax', 'espeon-gmax',
  'umbreon-gmax', 'leafeon-gmax', 'glaceon-gmax', 'sylveon-gmax',
]

watch(route, async () => {
  await loadPokemon(route.params.id)
  await nextTick()
})

onMounted(async () => {
  await loadPokemon(route.params.id)
  await nextTick()
})
</script>

<template>
  <!-- Loading: el SweetAlert se encarga del overlay, este div evita contenido residual -->
  <div v-if="isLoading" class="min-h-screen" />

  <div v-else-if="pokemon">
    <div class="w-full max-w-6xl mx-auto rounded-xl p-6 md:p-10 shadow-lg">
      <h1 class="font-black md:text-3xl text-xl text-red-900 mb-2">
        {{ formatPoke(pokemon.name) }}
      </h1>

      <div class="flex flex-wrap items-center gap-3 mt-3">
        <!-- TIPOS -->
        <span
          v-for="tipo in formattedTypes"
          :key="tipo.tipo"
          :class="tipo.color"
          class="py-1 px-3 shadow-md rounded-full text-white font-semibold"
        >
          {{ tipo.tipo }}
        </span>

        <!-- BOTÓN SHINY -->
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

      <br />

      <!-- SPRITES -->
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

      <!-- FORMAS -->
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

      <!-- EVOLUCIONES -->
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

      <!-- STATS -->
      <div class="mt-8">
        <button
          @click="changeChart"
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

      <!-- MOVIMIENTOS -->
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