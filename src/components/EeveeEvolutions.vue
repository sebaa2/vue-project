<!-- components/EeveeEvolutions.vue -->
<script setup>
import { computed } from 'vue'
import { formatPoke } from '../helpers/formatPoke.js'
import { formatTipos } from '../config/arrayTipo.js'
import notFound from '../assets/images/no_found.png'

const props = defineProps({
  evolutions: {
    type: Array,
    required: true,
  },
  currentPokemon: {
    type: String,
    required: true,
  },
  onGoToEvolution: {
    type: Function,
    required: true,
  },
})

// Lista de todas las evoluciones de Eevee (formas base)
const EEVEE_EVOLUTIONS = [
  'eevee',
  'vaporeon',
  'jolteon',
  'flareon',
  'espeon',
  'umbreon',
  'leafeon',
  'glaceon',
  'sylveon',
]

// Lista de formas especiales que NO deben mostrar la cadena evolutiva
const SPECIAL_FORMS = [
  'eevee-gmax',
  'eevee-starter', // Let's Go Eevee
  'vaporeon-gmax',
  'jolteon-gmax',
  'flareon-gmax',
  'espeon-gmax',
  'umbreon-gmax',
  'leafeon-gmax',
  'glaceon-gmax',
  'sylveon-gmax',
  // Puedes agregar más formas especiales aquí
]

// Verificar si es una forma especial
const isSpecialForm = computed(() => {
  return SPECIAL_FORMS.includes(props.currentPokemon?.toLowerCase())
})

// Verificar si el Pokémon actual es parte de la familia Eevee (forma base)
const isEeveeFamily = computed(() => {
  return EEVEE_EVOLUTIONS.includes(props.currentPokemon?.toLowerCase())
})

// Las 8 evoluciones de Eevee en orden específico para el grid
const eeveeEvolutions = computed(() => {
  console.log('Pokemon actual:', props.currentPokemon)

  // Si es una forma especial, no mostrar evoluciones
  if (isSpecialForm.value) return []

  // Si no es de la familia Eevee (forma base), no mostrar nada
  if (!isEeveeFamily.value) return []

  // Si no hay evoluciones, retornar array vacío
  if (!props.evolutions.length) return []

  // Aplanar todas las evoluciones en un solo array
  const allEvolutions = props.evolutions.flat()

  // Orden específico para las evoluciones de Eevee
  const evolutionOrder = [
    'vaporeon', // Agua
    'jolteon', // Eléctrico
    'flareon', // Fuego
    'espeon', // Psíquico
    'umbreon', // Siniestro
    'leafeon', // Planta
    'glaceon', // Hielo
    'sylveon', // Hada
  ]

  // Filtrar y ordenar las evoluciones
  const orderedEvolutions = evolutionOrder
    .map((name) => allEvolutions.find((evo) => evo.name === name))
    .filter(Boolean)

  return orderedEvolutions
})

// Verificar si tiene evoluciones
const hasEvolutions = computed(() => {
  return eeveeEvolutions.value.length > 0
})

// Determinar qué Pokémon está actualmente seleccionado para resaltarlo
const isCurrentPokemon = (evolutionName) => {
  return props.currentPokemon?.toLowerCase() === evolutionName?.toLowerCase()
}

// Obtener el sprite de Eevee (para el centro)
const eeveeSprite = computed(() => {
  // Buscar Eevee en las evoluciones
  const allEvolutions = props.evolutions.flat()
  const eevee = allEvolutions.find((evo) => evo.name === 'eevee')
  return (
    eevee?.sprite ||
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png'
  )
})

// Obtener el nombre base (sin el sufijo de forma especial)
const getBaseName = (name) => {
  return name.split('-')[0]
}
</script>

<template>
  <!-- CASO 1: Formas especiales - Mostrar mensaje -->
  <div v-if="isSpecialForm" class="mt-12 mb-8">
    <h2 class="text-xl font-bold text-center mb-4 text-gray-700">
      {{ formatPoke(getBaseName(currentPokemon)) }} (Forma Especial)
    </h2>

    <div class="text-center text-gray-500 py-8 bg-gray-50 rounded-lg max-w-2xl mx-auto">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 mx-auto text-gray-400 mb-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-lg font-medium">Forma especial sin evolución</p>
      <p class="text-sm mt-2">
        Esta es una forma especial de {{ formatPoke(getBaseName(currentPokemon)) }} que no tiene
        cadena evolutiva
      </p>
    </div>
  </div>

  <!-- CASO 2: Familia Eevee (formas base) - Mostrar grid especial -->
  <div v-else-if="isEeveeFamily" class="mt-12 mb-8">
    <h2 class="text-xl font-bold text-center mb-8 text-gray-700">Familia Eevee</h2>

    <!-- Mostrar mensaje si no hay evoluciones -->
    <div v-if="!hasEvolutions" class="text-center text-gray-500 py-8">
      <p>Cargando evoluciones de Eevee...</p>
    </div>

    <!-- Grid especial para la familia Eevee -->
    <div v-else class="relative max-w-3xl mx-auto">
      <!-- Grid container -->
      <div class="grid grid-cols-3 gap-4 md:gap-6 place-items-center">
        <!-- Fila superior (Vaporeon, Jolteon, Flareon) -->
        <div
          v-for="(evo, index) in eeveeEvolutions.slice(0, 3)"
          :key="evo.name"
          class="w-full flex justify-center"
        >
          <div
            @click="onGoToEvolution(evo.name)"
            :class="[
              'flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 w-28 sm:w-32',
              isCurrentPokemon(evo.name)
                ? 'bg-gray-200 ring-1 ring-gray-400 scale-105'
                : 'hover:bg-gray-100 hover:scale-105',
            ]"
          >
            <img
              :src="evo.sprite"
              :alt="evo.name"
              class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
              @error="(e) => (e.target.src = notFound)"
            />
            <p class="text-xs font-medium mt-2 text-gray-700">
              {{ formatPoke(evo.name) }}
            </p>
            <div class="flex gap-1 mt-1">
              <span
                v-for="tipo in evo.types"
                :key="tipo"
                :class="formatTipos(tipo).color"
                class="text-[8px] px-1.5 py-0.5 rounded-full text-white"
              >
                {{ formatTipos(tipo).tipo }}
              </span>
            </div>
          </div>
        </div>

        <!-- Fila media con Eevee al centro (Espeon, Eevee, Umbreon) -->
        <div class="col-span-3 grid grid-cols-3 gap-4 md:gap-6 w-full place-items-center my-4">
          <!-- Columna izquierda (Espeon) -->
          <div class="w-full flex justify-center">
            <div
              v-if="eeveeEvolutions[3]"
              @click="onGoToEvolution(eeveeEvolutions[3].name)"
              :class="[
                'flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 w-28 sm:w-32',
                isCurrentPokemon(eeveeEvolutions[3].name)
                  ? 'bg-gray-200 ring-1 ring-gray-400 scale-105'
                  : 'hover:bg-gray-100 hover:scale-105',
              ]"
            >
              <img
                :src="eeveeEvolutions[3].sprite"
                :alt="eeveeEvolutions[3].name"
                class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                @error="(e) => (e.target.src = notFound)"
              />
              <p class="text-xs font-medium mt-2 text-gray-700">
                {{ formatPoke(eeveeEvolutions[3].name) }}
              </p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="tipo in eeveeEvolutions[3].types"
                  :key="tipo"
                  :class="formatTipos(tipo).color"
                  class="text-[8px] px-1.5 py-0.5 rounded-full text-white"
                >
                  {{ formatTipos(tipo).tipo }}
                </span>
              </div>
            </div>
          </div>

          <!-- Centro - EEVEE (siempre visible) -->
          <div class="w-full flex justify-center">
            <div
              @click="onGoToEvolution('eevee')"
              :class="[
                'flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all duration-200',
                isCurrentPokemon('eevee')
                  ? 'bg-gray-200 ring-1 ring-gray-400 scale-105'
                  : 'hover:bg-gray-100 hover:scale-105',
              ]"
            >
              <div class="relative">
                <img
                  :src="eeveeSprite"
                  alt="eevee"
                  class="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                  @error="(e) => (e.target.src = notFound)"
                />
                <!-- Círculo decorativo alrededor de Eevee -->
                <div class="absolute inset-0 rounded-full border border-gray-300 opacity-30"></div>
              </div>
              <p class="text-sm font-bold mt-2 text-gray-800">Eevee</p>
              <div class="flex gap-1 mt-1">
                <span class="bg-gray-400 text-[8px] px-1.5 py-0.5 rounded-full text-white">
                  Normal
                </span>
              </div>
            </div>
          </div>

          <!-- Columna derecha (Umbreon) -->
          <div class="w-full flex justify-center">
            <div
              v-if="eeveeEvolutions[4]"
              @click="onGoToEvolution(eeveeEvolutions[4].name)"
              :class="[
                'flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 w-28 sm:w-32',
                isCurrentPokemon(eeveeEvolutions[4].name)
                  ? 'bg-gray-200 ring-1 ring-gray-400 scale-105'
                  : 'hover:bg-gray-100 hover:scale-105',
              ]"
            >
              <img
                :src="eeveeEvolutions[4].sprite"
                :alt="eeveeEvolutions[4].name"
                class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                @error="(e) => (e.target.src = notFound)"
              />
              <p class="text-xs font-medium mt-2 text-gray-700">
                {{ formatPoke(eeveeEvolutions[4].name) }}
              </p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="tipo in eeveeEvolutions[4].types"
                  :key="tipo"
                  :class="formatTipos(tipo).color"
                  class="text-[8px] px-1.5 py-0.5 rounded-full text-white"
                >
                  {{ formatTipos(tipo).tipo }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Fila inferior (Leafeon, Glaceon, Sylveon) -->
        <div
          v-for="(evo, index) in eeveeEvolutions.slice(5, 8)"
          :key="evo.name"
          class="w-full flex justify-center"
        >
          <div
            @click="onGoToEvolution(evo.name)"
            :class="[
              'flex flex-col items-center p-3 rounded-lg cursor-pointer transition-all duration-200 w-28 sm:w-32',
              isCurrentPokemon(evo.name)
                ? 'bg-gray-200 ring-1 ring-gray-400 scale-105'
                : 'hover:bg-gray-100 hover:scale-105',
            ]"
          >
            <img
              :src="evo.sprite"
              :alt="evo.name"
              class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
              @error="(e) => (e.target.src = notFound)"
            />
            <p class="text-xs font-medium mt-2 text-gray-700">
              {{ formatPoke(evo.name) }}
            </p>
            <div class="flex gap-1 mt-1">
              <span
                v-for="tipo in evo.types"
                :key="tipo"
                :class="formatTipos(tipo).color"
                class="text-[8px] px-1.5 py-0.5 rounded-full text-white"
              >
                {{ formatTipos(tipo).tipo }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Líneas para las evos -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: -1">
        <line
          x1="50%"
          y1="50%"
          x2="25%"
          y2="20%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="20%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="75%"
          y2="20%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="25%"
          y2="50%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="75%"
          y2="50%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="25%"
          y2="80%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="80%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
        <line
          x1="50%"
          y1="50%"
          x2="75%"
          y2="80%"
          stroke="#ccc"
          stroke-width="1"
          stroke-dasharray="4 3"
          opacity="0.9"
        />
      </svg>
    </div>
  </div>

  <!-- CASO 3: No mostrar nada si no es de la familia Eevee (el componente EvolutionChain se encargará) -->
  <div v-else style="display: none"></div>
</template>
