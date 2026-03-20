<script setup>
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

// Verificar si es Dudunsparce (cualquier variante)
const isDudunsparce = (evolutionName) => {
  return (
    evolutionName === 'dudunsparce' ||
    evolutionName === 'dudunsparce-two-segment' ||
    evolutionName === 'dudunsparce-three-segment'
  )
}

// Obtener sprite de Home específico para Dudunsparce
const getDudunsparceSprite = (evolutionName) => {
  // Si es 'dudunsparce' sin sufijo, usar sprite de 2 segmentos por defecto
  if (evolutionName === 'dudunsparce') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/982.png'
  }
  // Si ya tiene sufijo, usar el sprite correspondiente
  if (evolutionName === 'dudunsparce-two-segment') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/982.png'
  }
  if (evolutionName === 'dudunsparce-three-segment') {
    return 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/10238.png'
  }
  return null
}

// Obtener nombre para mostrar de Dudunsparce
const getDudunsparceDisplayName = (evolutionName) => {
  if (evolutionName === 'dudunsparce' || evolutionName === 'dudunsparce-two-segment') {
    return 'Dudunsparce'
  }
  if (evolutionName === 'dudunsparce-three-segment') {
    return 'Dudunsparce (3 segmentos)'
  }
  return null
}

// ============ FUNCIONES EXISTENTES MODIFICADAS ============

const isCurrentPokemon = (evolutionName) => {
  // Normalizar nombres para comparación
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

// Obtener nombre para mostrar
const getDisplayName = (evolution) => {
  const evolutionName = evolution.name || evolution

  // Caso especial: Dudunsparce
  if (isDudunsparce(evolutionName)) {
    const displayName = getDudunsparceDisplayName(evolutionName)
    if (displayName) return displayName
  }

  // Si ya tiene displayName predefinido
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

// Obtener sprite de evolución (usando sprites de Home)
const getEvolutionSprite = (evolution) => {
  const evolutionName = evolution.name || evolution

  // Caso especial: Dudunsparce
  if (isDudunsparce(evolutionName)) {
    const sprite = getDudunsparceSprite(evolutionName)
    if (sprite) return sprite
  }

  // Priorizar sprite ya definido
  if (evolution.sprite) {
    return evolution.sprite
  }

  // Usar sprites de Home si existen
  if (evolution.sprites?.other?.home?.front_default) {
    return evolution.sprites.other.home.front_default
  }

  // Fallback a sprites normales
  if (evolution.sprites?.front_default) {
    return evolution.sprites.front_default
  }

  // Si tiene ID, construir URL de Home
  if (evolution.id) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${evolution.id}.png`
  }

  return notFound
}

// Obtener tipos de evolución
const getEvolutionTypes = (evolution) => {
  const evolutionName = evolution.name || evolution

  // Dudunsparce es tipo Normal
  if (isDudunsparce(evolutionName)) {
    return ['normal']
  }

  if (evolution.types && evolution.types.length > 0) {
    return evolution.types
  }
  return []
}

// Manejar click en evolución
const handleEvolutionClick = (evolution) => {
  let evolutionName = evolution.name || evolution

  // Si es Dudunsparce sin sufijo, usar el nombre correcto para la API
  if (evolutionName === 'dudunsparce') {
    evolutionName = 'dudunsparce-two-segment'
  }

  console.log('Click en evolución:', evolutionName)
  props.onGoToEvolution(evolutionName)
}

// Obtener badge de forma especial si aplica
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
</script>

<template>
  <div v-if="evolutions.length > 1" class="mt-8">
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6">Línea Evolutiva</h2>

    <div class="flex flex-wrap items-center justify-center gap-2">
      <template v-for="(level, levelIndex) in evolutions" :key="levelIndex">
        <div class="flex flex-col items-center text-center">
          <p class="text-xs sm:text-sm font-medium text-gray-500 mb-2">
            {{ getLevelText(levelIndex) }}
          </p>

          <div class="flex flex-wrap justify-center gap-4">
            <div
              v-for="evolution in level"
              :key="evolution.name"
              class="flex flex-col items-center"
            >
              <div class="flex flex-col gap-2">
                <div
                  @click="handleEvolutionClick(evolution)"
                  :class="[
                    'flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors relative',
                    isCurrentPokemon(evolution.name)
                      ? 'bg-blue-100 ring-2 ring-blue-500'
                      : 'hover:bg-gray-100',
                  ]"
                >
                  <img
                    :src="getEvolutionSprite(evolution)"
                    :alt="evolution.name"
                    class="w-20 h-20 sm:w-24 sm:h-24 object-contain"
                    @error="(e) => (e.target.src = notFound)"
                  />
                  <p class="text-xs font-medium mt-1">{{ getDisplayName(evolution) }}</p>
                  <div class="flex gap-1 mt-1 flex-wrap justify-center">
                    <span
                      v-for="tipo in getEvolutionTypes(evolution)"
                      :key="tipo"
                      :class="formatTipos(tipo).color"
                      class="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                    >
                      {{ formatTipos(tipo).tipo }}
                    </span>
                  </div>

                  <!-- Badge para Dudunsparce de 3 segmentos -->
                  <span
                    v-if="evolution.name === 'dudunsparce-three-segment'"
                    class="absolute -top-2 -right-2 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md bg-amber-600"
                  >
                    3 Segmentos
                  </span>

                  <!-- Badge para otras formas regionales/especiales -->
                  <span
                    v-else-if="
                      evolution.isRegional ||
                      evolution.isSpecialForm ||
                      evolution.style ||
                      getRegionFromForm(evolution.name)
                    "
                    class="absolute -top-2 -right-2 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md"
                    :class="
                      getBadgeColor(
                        evolution.region || evolution.style || getRegionFromForm(evolution.name),
                      )
                    "
                  >
                    {{ evolution.region || evolution.style || getRegionFromForm(evolution.name) }}
                  </span>
                </div>

                <!-- Método de evolución -->
                <div v-if="evolution.method && levelIndex > 0" class="mt-1 text-center">
                  <p class="text-[10px] px-2 py-1 rounded-full text-gray-500 italic bg-gray-100">
                    {{ evolution.method }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flecha entre niveles -->
        <div
          v-if="levelIndex < evolutions.length - 1"
          class="text-3xl sm:text-4xl text-gray-400 font-bold self-center"
          style="margin-top: 1.5rem"
        >
          →
        </div>
      </template>
    </div>
  </div>

  <div v-else-if="evolutions.length === 1" class="mt-8 text-center text-gray-500">
    <p>Este Pokémon no tiene evoluciones</p>
  </div>
</template>
