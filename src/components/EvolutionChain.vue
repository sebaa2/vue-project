<!-- components/EvolutionChain.vue -->
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

const isCurrentPokemon = (evolutionName) => {
  return props.currentPokemon === evolutionName
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

// Obtener nombre para mostrar (con indicador regional)
const getDisplayName = (evolution) => {
  // Si ya tenemos un displayName predefinido (de getEvo.js), usarlo
  if (evolution.displayName) {
    return evolution.displayName
  }

  const baseName = formatPoke(evolution.name)

  if (evolution.name.includes('-alola')) return `${baseName.replace('-alola', '')} (Alola)`
  if (evolution.name.includes('-galar')) return `${baseName.replace('-galar', '')} (Galar)`
  if (evolution.name.includes('-hisui')) return `${baseName.replace('-hisui', '')} (Hisui)`
  if (evolution.name.includes('-paldea')) return `${baseName.replace('-paldea', '')} (Paldea)`

  return baseName
}

// Obtener la región de una forma
const getRegionFromForm = (formName) => {
  if (formName.includes('-alola')) return 'Alola'
  if (formName.includes('-galar')) return 'Galar'
  if (formName.includes('-hisui')) return 'Hisui'
  if (formName.includes('-paldea')) return 'Paldea'
  return 'Regional'
}

// Obtener sprite de evolución
const getEvolutionSprite = (evolution, formName = null) => {
  if (formName && evolution.form_sprites?.[formName]?.front_default) {
    return evolution.form_sprites[formName].front_default
  }
  if (evolution.sprites?.front_default) {
    return evolution.sprites.front_default
  }
  if (evolution.sprite) {
    return evolution.sprite
  }
  return notFound
}

// Obtener tipos de una forma específica
const getFormTypes = (evolution, formName) => {
  if (formName && evolution.form_types?.[formName]) {
    return evolution.form_types[formName]
  }
  return evolution.types || []
}

// Determinar si un método es regional
const isRegionalMethod = (method) => {
  return (
    method &&
    (method.includes('Alola') ||
      method.includes('Galar') ||
      method.includes('Hisui') ||
      method.includes('Paldea') ||
      method === 'Forma Regional')
  )
}

// Obtener color del badge según región
const getRegionBadgeColor = (region) => {
  const colors = {
    Alola: 'bg-yellow-500',
    Galar: 'bg-red-500',
    Hisui: 'bg-blue-500',
    Paldea: 'bg-green-500',
  }
  return colors[region] || 'bg-purple-600'
}
</script>

<template>
  <div v-if="evolutions.length > 1" class="mt-8">
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6">Línea Evolutiva</h2>

    <!-- Contenedor flex simple -->
    <div class="flex flex-wrap items-center justify-center gap-2">
      <template v-for="(level, levelIndex) in evolutions" :key="levelIndex">
        <!-- Nivel evolutivo -->
        <div class="flex flex-col items-center text-center">
          <p class="text-xs sm:text-sm font-medium text-gray-500 mb-2">
            {{ getLevelText(levelIndex) }}
          </p>

          <!-- Múltiples evoluciones en el mismo nivel -->
          <div class="flex flex-wrap justify-center gap-4">
            <div
              v-for="evolution in level"
              :key="evolution.name"
              class="flex flex-col items-center"
            >
              <!-- Forma original y sus regionales -->
              <div class="flex flex-col gap-2">
                <!-- Forma original o regional -->
                <div
                  @click="onGoToEvolution(evolution.name)"
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
                    class="w-20 h-20 sm:w-24 sm:h-24"
                    @error="(e) => (e.target.src = notFound)"
                  />
                  <p class="text-xs font-medium mt-1">{{ getDisplayName(evolution) }}</p>
                  <div class="flex gap-1 mt-1 flex-wrap justify-center">
                    <span
                      v-for="tipo in evolution.types"
                      :key="tipo"
                      :class="formatTipos(tipo).color"
                      class="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                    >
                      {{ formatTipos(tipo).tipo }}
                    </span>
                  </div>

                  <!-- Badge de forma regional -->
                  <span
                    v-if="evolution.isRegional"
                    class="absolute -top-2 -right-2 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md"
                    :class="getRegionBadgeColor(evolution.region)"
                  >
                    {{ evolution.region }}
                  </span>
                </div>

                <!-- Método de evolución (solo si no es el primer nivel) -->
                <div v-if="evolution.method && levelIndex > 0" class="mt-1 text-center">
                  <p
                    :class="[
                      'text-[10px] px-2 py-1 rounded-full',
                      isRegionalMethod(evolution.method)
                        ? getRegionBadgeColor(evolution.region) + ' text-white'
                        : 'text-gray-500 italic bg-gray-100',
                    ]"
                  >
                    {{ evolution.method }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flecha entre niveles (excepto después del último) -->
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

  <!-- Sin evoluciones -->
  <div v-else-if="evolutions.length === 1" class="mt-8 text-center text-gray-500">
    <p>Este Pokémon no tiene evoluciones</p>
  </div>
</template>
