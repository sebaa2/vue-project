<!-- components/moves/MoveRow.vue -->
<script setup>
import { formatTipos } from '../../config/arrayTipo.js'
import physicalIcon from '../../assets/categories/physical.png'
import specialIcon from '../../assets/categories/special.png'
import statusIcon from '../../assets/categories/status.png'

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
</script>

<template>
  <div
    class="hover:bg-gray-50 transition-colors"
    :class="{ 'bg-gray-50': index % 2 === 0, 'bg-white': index % 2 === 1 }"
  >
    <div class="flex items-center p-3 gap-2">
      <div class="w-24">
        <span
          :class="formatTipos(move.type).color"
          class="px-2 py-1 rounded-full text-white text-sm block text-center"
        >
          {{ formatTipos(move.type).tipo }}
        </span>
      </div>

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

      <div class="flex-1">
        <span class="font-medium text-gray-800">
          {{ formatName(move.name) }}
        </span>
      </div>

      <div class="w-16 text-center text-gray-600 font-mono">
        {{ move.power && move.power !== '-' ? move.power : '—' }}
      </div>

      <div class="w-16 text-center text-gray-600 font-mono">
        {{ move.pp || '—' }}
      </div>

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

    <MoveDetails
      v-if="expandedMove === move.name"
      :move="move"
    />
  </div>
</template>

<script>
import MoveDetails from './MoveDetails.vue'
export default {
  components: { MoveDetails }
}
</script>