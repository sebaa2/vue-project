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
</script>

<template>
  <div v-if="evolutions.length > 1" class="mt-8">
    <h2 class="text-lg sm:text-xl md:text-2xl font-bold text-center mb-6">Línea Evolutiva</h2>

    <!-- Contenedor flex simple -->
    <div class="flex flex-wrap items-center justify-center gap-2">
      <template v-for="(level, levelIndex) in evolutions" :key="levelIndex">
        <!-- Nivel evolutivo -->
        <div class="flex flex-col items-center text-center min-w-[120px]">
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
                'flex flex-col items-center p-2 mb-2 rounded-lg cursor-pointer transition-colors w-full',
                isCurrentPokemon(evolution.name)
                  ? 'bg-blue-100 ring-1 ring-blue-500'
                  : 'hover:bg-gray-100',
              ]"
            >
              <img
                :src="evolution.sprite"
                :alt="evolution.name"
                class="w-16 h-16 sm:w-20 sm:h-20"
                @error="(e) => (e.target.src = notFound)"
              />
              <p class="text-xs font-medium mt-1">{{ formatPoke(evolution.name) }}</p>
              <div class="flex gap-1 mt-1">
                <span
                  v-for="tipo in evolution.types"
                  :key="tipo"
                  :class="formatTipos(tipo).color"
                  class="text-[10px] px-1.5 py-0.5 rounded-full text-white"
                >
                  {{ formatTipos(tipo).tipo }}
                </span>
              </div>
            </div>
          </template>

          <!-- Una evolución -->
          <div
            v-else
            @click="onGoToEvolution(level.name)"
            :class="[
              'flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors w-full',
              isCurrentPokemon(level.name)
                ? 'bg-blue-100 ring-1 ring-blue-500'
                : 'hover:bg-gray-100',
            ]"
          >
            <img
              :src="level.sprite"
              :alt="level.name"
              class="w-16 h-16 sm:w-20 sm:h-20"
              @error="(e) => (e.target.src = notFound)"
            />
            <p class="text-xs font-medium mt-1">{{ formatPoke(level.name) }}</p>
            <div class="flex gap-1 mt-1">
              <span
                v-for="tipo in level.types"
                :key="tipo"
                :class="formatTipos(tipo).color"
                class="text-[10px] px-1.5 py-0.5 rounded-full text-white"
              >
                {{ formatTipos(tipo).tipo }}
              </span>
            </div>
          </div>
        </div>

        <!-- Flecha entre niveles (excepto después del último) -->
        <div
          v-if="levelIndex < evolutions.length - 1"
          class="text-3xl sm:text-4xl text-gray-400 font-bold mx-1 self-center"
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
