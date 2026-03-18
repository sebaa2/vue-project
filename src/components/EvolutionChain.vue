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

// Formatear detalles del método de evolución
const formatEvolutionDetails = (details) => {
  if (!details || details.length === 0) return null

  const detail = details[0] // Tomamos el primer detalle (normalmente el más relevante)
  const methods = []

  // Métodos comunes de evolución
  if (detail.min_level) {
    methods.push(`Nivel ${detail.min_level}`)
  }

  if (detail.item) {
    const itemName = detail.item.name.replace(/-/g, ' ')
    methods.push(`Usando ${itemName}`)
  }

  if (detail.trigger) {
    switch (detail.trigger.name) {
      case 'level-up':
        if (!detail.min_level) methods.push('Subir de nivel')
        break
      case 'trade':
        methods.push('Intercambiar')
        break
      case 'use-item':
        if (!detail.item) methods.push('Usar objeto')
        break
      case 'shed':
        methods.push('Evolución especial')
        break
      case 'spin':
        methods.push('Girar')
        break
      case 'tower-of-darkness':
        methods.push('Torre Oscuridad')
        break
      case 'tower-of-waters':
        methods.push('Torre Agua')
        break
      case 'three-critical-hits':
        methods.push('3 golpes críticos')
        break
      case 'take-damage':
        methods.push('Recibir daño')
        break
      case 'other':
        methods.push('Método especial')
        break
    }
  }

  // Condiciones adicionales
  if (detail.location) {
    methods.push(`en ${detail.location.name.replace(/-/g, ' ')}`)
  }

  if (detail.held_item) {
    const heldItemName = detail.held_item.name.replace(/-/g, ' ')
    methods.push(`con ${heldItemName}`)
  }

  if (detail.time_of_day) {
    methods.push(`de ${detail.time_of_day}`)
  }

  if (detail.known_move) {
    const moveName = detail.known_move.name.replace(/-/g, ' ')
    methods.push(`sabiendo ${moveName}`)
  }

  if (detail.known_move_type) {
    const typeName = detail.known_move_type.name
    methods.push(`con movimiento de tipo ${typeName}`)
  }

  if (detail.min_happiness) {
    methods.push(`felicidad ≥ ${detail.min_happiness}`)
  }

  if (detail.min_beauty) {
    methods.push(`belleza ≥ ${detail.min_beauty}`)
  }

  if (detail.min_affection) {
    methods.push(`afecto ≥ ${detail.min_affection}`)
  }

  if (detail.relative_physical_stats) {
    if (detail.relative_physical_stats === 1) {
      methods.push('Ataque > Defensa')
    } else if (detail.relative_physical_stats === -1) {
      methods.push('Ataque < Defensa')
    } else if (detail.relative_physical_stats === 0) {
      methods.push('Ataque = Defensa')
    }
  }

  if (detail.gender) {
    methods.push(detail.gender === 1 ? '♀ Hembra' : '♂ Macho')
  }

  if (detail.overworld_rain) {
    methods.push('lloviendo')
  }

  if (detail.turn_upside_down) {
    methods.push('dispositivo boca abajo')
  }

  return methods.length > 0 ? methods.join(' · ') : null
}

// Obtener sprite de evolución
const getEvolutionSprite = (evolution) => {
  if (evolution.sprites?.front_default) {
    return evolution.sprites.front_default
  }
  if (evolution.sprite) {
    return evolution.sprite
  }
  return notFound
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

          <!-- Múltiples evoluciones -->
          <template v-if="Array.isArray(level)">
            <div
              v-for="evolution in level"
              :key="evolution.name"
              @click="onGoToEvolution(evolution.name)"
              :class="[
                'flex flex-col items-center p-2 mb-2 rounded-lg cursor-pointer transition-colors',
                isCurrentPokemon(evolution.name)
                  ? 'bg-blue-100 ring-1 ring-blue-500'
                  : 'hover:bg-gray-100',
              ]"
            >
              <img
                :src="getEvolutionSprite(evolution)"
                :alt="evolution.name"
                class="w-16 h-16 sm:w-20 sm:h-20"
                @error="(e) => (e.target.src = notFound)"
              />
              <p class="text-xs font-medium mt-1">{{ formatPoke(evolution.name) }}</p>
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

              <!-- Mostrar método de evolución -->
              <div
                v-if="evolution.evolution_details && evolution.evolution_details.length > 0"
                class="mt-1"
              >
                <p class="text-[10px] text-gray-500 italic">
                  {{ formatEvolutionDetails(evolution.evolution_details) }}
                </p>
              </div>
            </div>
          </template>

          <!-- Una evolución -->
          <div
            v-else
            @click="onGoToEvolution(level.name)"
            :class="[
              'flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors',
              isCurrentPokemon(level.name)
                ? 'bg-blue-100 ring-1 ring-blue-500'
                : 'hover:bg-gray-100',
            ]"
          >
            <img
              :src="getEvolutionSprite(level)"
              :alt="level.name"
              class="w-16 h-16 sm:w-20 sm:h-20"
              @error="(e) => (e.target.src = notFound)"
            />
            <p class="text-xs font-medium mt-1">{{ formatPoke(level.name) }}</p>
            <div class="flex gap-1 mt-1 flex-wrap justify-center">
              <span
                v-for="tipo in level.types"
                :key="tipo"
                :class="formatTipos(tipo).color"
                class="text-[10px] px-1.5 py-0.5 rounded-full text-white"
              >
                {{ formatTipos(tipo).tipo }}
              </span>
            </div>

            <!-- Mostrar método de evolución -->
            <div v-if="level.evolution_details && level.evolution_details.length > 0" class="mt-1">
              <p class="text-[10px] text-gray-500 italic">
                {{ formatEvolutionDetails(level.evolution_details) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Flecha entre niveles (excepto después del último) -->
        <div
          v-if="levelIndex < evolutions.length - 1"
          class="text-3xl sm:text-4xl text-gray-400 font-bold"
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
