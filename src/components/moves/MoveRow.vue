<script setup>
import { formatTipos } from '../../config/arrayTipo.js'
import physicalIcon from '../../assets/categories/physical.png'
import specialIcon from '../../assets/categories/special.png'
import statusIcon from '../../assets/categories/status.png'
import MoveDetails from './MoveDetails.vue'

const props = defineProps({
  move: Object,
  index: Number,
  expandedMove: String,
})

const emit = defineEmits(['toggle-details'])

const CATEGORY_ICON = {
  physical: physicalIcon,
  special: specialIcon,
  status: statusIcon,
}

const CATEGORY_LABEL = {
  physical: 'Físico',
  special: 'Especial',
  status: 'Estado',
}

const formatName = (name) => {
  const parts = name.split('-')
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  }
  return parts
    .slice(1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getCategoryColor = (category) => {
  const colors = {
    physical: 'bg-red-500',
    special: 'bg-blue-500',
    status: 'bg-green-500',
  }
  return colors[category] || 'bg-gray-500'
}

const formatAccuracy = (accuracy) => {
  if (!accuracy && accuracy !== 0) return '—'
  if (accuracy === null) return '—'
  return `${accuracy}%`
}

// Devuelve { label, classes } para mostrar cómo se aprende el movimiento
const getLevelDisplay = (move) => {
  const method = move.learnMethod
  const level = move.levelLearnedAt

  if (method === 'level-up') {
    if (level === 0) {
      return { label: 'Evo.', classes: 'bg-purple-100 text-purple-700 font-semibold' }
    }
    return { label: `Nv. ${level}`, classes: 'bg-blue-100 text-blue-700 font-mono' }
  }
  if (method === 'machine') {
    return { label: 'MT/MO', classes: 'bg-yellow-100 text-yellow-700' }
  }
  if (method === 'egg') {
    return { label: 'Huevo', classes: 'bg-orange-100 text-orange-700' }
  }
  if (method === 'tutor') {
    return { label: 'Tutor', classes: 'bg-green-100 text-green-700' }
  }
  return { label: '—', classes: 'text-gray-400' }
}
</script>

<template>
  <div
    class="hover:bg-gray-50 transition-colors"
    :class="{ 'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1 }"
  >
    <div class="flex items-center p-3 gap-2">
      <!-- Tipo -->
      <div class="w-24">
        <span
          :class="formatTipos(move.type).color"
          class="px-2 py-1 rounded-full text-white text-sm block text-center"
        >
          {{ formatTipos(move.type).tipo }}
        </span>
      </div>

      <!-- Categoría -->
      <div class="w-28">
        <span
          :class="getCategoryColor(move.category)"
          class="px-2 py-1 rounded-full text-white inline-flex items-center gap-1 text-sm"
        >
          <img
            v-if="CATEGORY_ICON[move.category]"
            :src="CATEGORY_ICON[move.category]"
            :alt="move.category"
            class="h-5 w-5"
          />
          {{ CATEGORY_LABEL[move.category] ?? move.category }}
        </span>
      </div>

      <!-- Nombre -->
      <div class="flex-1">
        <span class="font-medium text-gray-800">
          {{ formatName(move.name) }}
        </span>
      </div>

      <!-- Nivel / método de aprendizaje -->
      <div class="w-16 text-center">
        <span :class="getLevelDisplay(move).classes" class="px-2 py-0.5 rounded text-xs">
          {{ getLevelDisplay(move).label }}
        </span>
      </div>

      <!-- Poder -->
      <div class="w-16 text-center text-gray-600 font-mono">
        {{ move.power && move.power !== '-' ? move.power : '—' }}
      </div>

      <!-- PP -->
      <div class="w-16 text-center text-gray-600 font-mono">
        {{ move.pp || '—' }}
      </div>

      <!-- Precisión -->
      <div class="w-16 text-center text-gray-600 font-mono">
        {{ formatAccuracy(move.accuracy) }}
      </div>

      <!-- Toggle detalles -->
      <button
        @click="emit('toggle-details', move.name)"
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
        :aria-label="expandedMove === move.name ? 'Ocultar detalles' : 'Mostrar detalles'"
      >
        <span class="text-gray-500">
          {{ expandedMove === move.name ? '▲' : '▼' }}
        </span>
      </button>
    </div>

    <MoveDetails v-if="expandedMove === move.name" :move="move" />
  </div>
</template>
