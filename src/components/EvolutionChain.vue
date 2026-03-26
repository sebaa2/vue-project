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

// ============ FUNCIONES ESPECÍFICAS PARA DUDUNSPARCE ============

const isDudunsparce = (evolutionName) => {
  return (
    evolutionName === 'dudunsparce' ||
    evolutionName === 'dudunsparce-two-segment' ||
    evolutionName === 'dudunsparce-three-segment'
  )
}

const getDudunsparceSprite = (evolutionName) => {
  if (evolutionName === 'dudunsparce') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/982.png'
  }
  if (evolutionName === 'dudunsparce-two-segment') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/982.png'
  }
  if (evolutionName === 'dudunsparce-three-segment') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10238.png'
  }
  return null
}

const getDudunsparceDisplayName = (evolutionName) => {
  if (evolutionName === 'dudunsparce' || evolutionName === 'dudunsparce-two-segment') {
    return 'Dudunsparce'
  }
  if (evolutionName === 'dudunsparce-three-segment') {
    return 'Dudunsparce (3 segmentos)'
  }
  return null
}

// ============ FUNCIONES EXISTENTES ============

const isCurrentPokemon = (evolutionName) => {
  const normalize = (name) => {
    if (name === 'dudunsparce' || name === 'dudunsparce-two-segment') return 'dudunsparce'
    if (name === 'dudunsparce-three-segment') return 'dudunsparce-three-segment'
    return name
  }
  return normalize(props.currentPokemon) === normalize(evolutionName)
}

const getLevelText = (index) => {
  switch (index) {
    case 0:
      return 'Base'
    case 1:
      return 'Primera Etapa'
    default:
      return 'Segunda Etapa'
  }
}

const getDisplayName = (evolution) => {
  const evolutionName = evolution.name || evolution

  if (isDudunsparce(evolutionName)) {
    const displayName = getDudunsparceDisplayName(evolutionName)
    if (displayName) return displayName
  }

  if (evolution.displayName) {
    return evolution.displayName
  }

  const baseName = formatPoke(evolutionName)

  if (evolutionName.includes('-alola')) return `${baseName.replace('-alola', '')} (Alola)`
  if (evolutionName.includes('-galar')) return `${baseName.replace('-galar', '')} (Galar)`
  if (evolutionName.includes('-hisui')) return `${baseName.replace('-hisui', '')} (Hisui)`
  if (evolutionName.includes('-paldea')) return `${baseName.replace('-paldea', '')} (Paldea)`

  return baseName
}

const getEvolutionSprite = (evolution) => {
  const evolutionName = evolution.name || evolution

  if (isDudunsparce(evolutionName)) {
    const sprite = getDudunsparceSprite(evolutionName)
    if (sprite) return sprite
  }

  if (evolution.sprite) {
    return evolution.sprite
  }

  if (evolution.sprites?.other?.home?.front_default) {
    return evolution.sprites.other.home.front_default
  }

  if (evolution.sprites?.front_default) {
    return evolution.sprites.front_default
  }

  if (evolution.id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${evolution.id}.png`
  }

  return notFound
}

const getEvolutionTypes = (evolution) => {
  const evolutionName = evolution.name || evolution

  if (isDudunsparce(evolutionName)) {
    return ['normal']
  }

  if (evolution.types && evolution.types.length > 0) {
    return evolution.types
  }
  return []
}

const handleEvolutionClick = (evolution) => {
  let evolutionName = evolution.name || evolution

  if (evolutionName === 'dudunsparce') {
    evolutionName = 'dudunsparce-two-segment'
  }

  console.log('Click en evolución:', evolutionName)
  props.onGoToEvolution(evolutionName)
}

const getRegionFromForm = (formName) => {
  if (formName.includes('-alola')) return 'Alola'
  if (formName.includes('-galar')) return 'Galar'
  if (formName.includes('-hisui')) return 'Hisui'
  if (formName.includes('-paldea')) return 'Paldea'
  if (formName.includes('single-strike')) return 'Brusco'
  if (formName.includes('rapid-strike')) return 'Fluido'
  if (formName.includes('amped')) return 'Amped'
  if (formName.includes('low-key')) return 'Low Key'
  if (formName.includes('three-segment')) return '3 Segmentos'
  return null
}

const getBadgeColor = (region) => {
  const colors = {
    Alola: 'bg-yellow-500',
    Galar: 'bg-red-500',
    Hisui: 'bg-blue-500',
    Paldea: 'bg-green-500',
    Brusco: 'bg-purple-600',
    Fluido: 'bg-cyan-500',
    Amped: 'bg-orange-500',
    'Low Key': 'bg-indigo-500',
    '3 Segmentos': 'bg-amber-600',
  }
  return colors[region] || 'bg-purple-600'
}

// ============ HELPERS DE TABLA ============

// Número máximo de evos en cualquier nivel (define cuántas filas necesita la tabla)
const maxRows = computed(() => Math.max(...props.evolutions.map((level) => level.length)))

// Cuántas filas ocupa cada celda de un nivel dado
const getRowspan = (level) => Math.ceil(maxRows.value / level.length)

// ¿Debe renderizarse una celda en esta fila?
const shouldRenderCell = (level, rowIndex) => (rowIndex - 1) % getRowspan(level) === 0

// ¿Qué evolución mostrar en esta fila para este nivel?
const getEvolutionForRow = (level, rowIndex) => {
  const span = getRowspan(level)
  const evoIndex = Math.floor((rowIndex - 1) / span)
  return level[evoIndex]
}
</script>

<template>
  <!-- Cadena evolutiva en tabla -->
  <div v-if="evolutions.length > 1" class="mt-8">
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6">Línea Evolutiva</h2>

    <div class="overflow-x-auto">
      <table class="border-collapse mx-auto">

        <!-- Encabezados -->
        <thead>
          <tr>
            <template v-for="(level, levelIndex) in evolutions" :key="`head-${levelIndex}`">
              <th class="px-6 py-2 text-xs sm:text-sm font-semibold text-gray-500 text-center tracking-wide uppercase">
                {{ getLevelText(levelIndex) }}
              </th>
              <th v-if="levelIndex < evolutions.length - 1" class="px-3" aria-hidden="true" />
            </template>
          </tr>
        </thead>

        <!-- Una fila por cada "slot" (máx. evos en un nivel) -->
        <tbody>
          <tr v-for="rowIndex in maxRows" :key="`row-${rowIndex}`">
            <template v-for="(level, levelIndex) in evolutions" :key="`cell-${levelIndex}-${rowIndex}`">

              <!-- Celda de Pokémon: solo si le toca renderizarse en esta fila -->
              <td
                v-if="shouldRenderCell(level, rowIndex)"
                :rowspan="getRowspan(level)"
                class="px-4 py-3 align-middle text-center"
              >
                <div
                  @click="handleEvolutionClick(getEvolutionForRow(level, rowIndex))"
                  :class="[
                    'inline-flex flex-col items-center p-3 rounded-xl cursor-pointer transition-colors relative w-28',
                    isCurrentPokemon(getEvolutionForRow(level, rowIndex).name)
                      ? 'bg-blue-100 ring-2 ring-blue-500'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  <!-- Sprite -->
                  <img
                    :src="getEvolutionSprite(getEvolutionForRow(level, rowIndex))"
                    :alt="getEvolutionForRow(level, rowIndex).name"
                    class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                    @error="(e) => (e.target.src = notFound)"
                  />

                  <!-- Nombre -->
                  <p class="text-xs font-semibold mt-2 text-center leading-tight">
                    {{ getDisplayName(getEvolutionForRow(level, rowIndex)) }}
                  </p>

                  <!-- Tipos -->
                  <div class="flex gap-1 mt-1 flex-wrap justify-center">
                    <span
                      v-for="tipo in getEvolutionTypes(getEvolutionForRow(level, rowIndex))"
                      :key="tipo"
                      :class="formatTipos(tipo).color"
                      class="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                    >
                      {{ formatTipos(tipo).tipo }}
                    </span>
                  </div>

                  <!-- Método de evolución -->
                  <p
                    v-if="getEvolutionForRow(level, rowIndex).method && levelIndex > 0"
                    class="text-[10px] mt-2 px-2 py-1 rounded-full text-gray-500 italic bg-gray-100 text-center"
                  >
                    {{ getEvolutionForRow(level, rowIndex).method }}
                  </p>

                  <!-- Badge Dudunsparce 3 segmentos -->
                  <span
                    v-if="getEvolutionForRow(level, rowIndex).name === 'dudunsparce-three-segment'"
                    class="absolute -top-2 -right-2 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md bg-amber-600"
                  >
                    3 Segmentos
                  </span>

                  <!-- Badge formas regionales / especiales -->
                  <span
                    v-else-if="
                      getEvolutionForRow(level, rowIndex).isRegional ||
                      getEvolutionForRow(level, rowIndex).isSpecialForm ||
                      getEvolutionForRow(level, rowIndex).style ||
                      getRegionFromForm(getEvolutionForRow(level, rowIndex).name)
                    "
                    class="absolute -top-2 -right-2 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md"
                    :class="
                      getBadgeColor(
                        getEvolutionForRow(level, rowIndex).region ||
                        getEvolutionForRow(level, rowIndex).style ||
                        getRegionFromForm(getEvolutionForRow(level, rowIndex).name),
                      )
                    "
                  >
                    {{
                      getEvolutionForRow(level, rowIndex).region ||
                      getEvolutionForRow(level, rowIndex).style ||
                      getRegionFromForm(getEvolutionForRow(level, rowIndex).name)
                    }}
                  </span>
                </div>
              </td>

              <!-- Flecha: solo en primera fila, ocupa todas las filas con rowspan -->
              <td
                v-if="levelIndex < evolutions.length - 1 && rowIndex === 1"
                :rowspan="maxRows"
                class="px-3 text-center align-middle text-2xl sm:text-3xl text-gray-400 font-bold"
                aria-hidden="true"
              >
                →
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Sin evoluciones -->
  <div v-else-if="evolutions.length === 1" class="mt-8 text-center text-gray-500">
    <p>Este Pokémon no tiene evoluciones</p>
  </div>
</template>