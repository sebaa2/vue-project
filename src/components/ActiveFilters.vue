<!-- src/components/ActiveFilters.vue -->
<template>
  <div class="flex flex-wrap gap-2 items-center">
    <span class="text-xs text-gray-500">Filtros activos:</span>
    
    <button
      v-if="searchQuery"
      @click="$emit('remove', 'search')"
      class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
    >
      🔍 {{ searchQuery }}
      <span class="text-blue-500 hover:text-blue-700">✕</span>
    </button>
    
    <button
      v-if="primaryType !== 'all'"
      @click="$emit('remove', 'primaryType')"
      class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
    >
      📌 Tipo: {{ formatTipo(primaryType) }}
      <span class="text-blue-500 hover:text-blue-700">✕</span>
    </button>
    
    <button
      v-if="secondaryType !== 'all'"
      @click="$emit('remove', 'secondaryType')"
      class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
    >
      🔹 Tipo 2:
      {{ secondaryType === 'none' ? 'Sin segundo tipo' : formatTipo(secondaryType) }}
      <span class="text-blue-500 hover:text-blue-700">✕</span>
    </button>
    
    <button
      v-if="generation !== 'all'"
      @click="$emit('remove', 'generation')"
      class="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
    >
      📅 {{ getGenerationName(generation) }}
      <span class="text-blue-500 hover:text-blue-700">✕</span>
    </button>
    
    <button
      v-if="showMegas"
      @click="$emit('remove', 'megas')"
      class="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full hover:bg-purple-200 transition-colors"
    >
      ⚡ Solo Megas
      <span class="text-purple-500 hover:text-purple-700">✕</span>
    </button>
  </div>
</template>

<script setup>
import { usePokemonUtils } from '../composables/usePokemonUtils.js'
import { usePokemonGeneration } from '../composables/usePokemonGeneration.js'

const { formatTipo } = usePokemonUtils()
const { getGenerationName } = usePokemonGeneration()

defineProps({
  searchQuery: String,
  primaryType: String,
  secondaryType: String,
  generation: [String, Number],
  showMegas: Boolean
})

defineEmits(['remove'])
</script>