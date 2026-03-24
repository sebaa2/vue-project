<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
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

const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

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
    <!-- Versión Desktop -->
    <div v-if="!isMobile" class="flex items-center p-3 gap-2">
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

      <div class="w-16 text-center">
        <span :class="getLevelDisplay(move).classes" class="px-2 py-0.5 rounded text-xs">
          {{ getLevelDisplay(move).label }}
        </span>
      </div>

      <div class="w-16 text-center text-gray-600 font-mono">
        {{ move.power && move.power !== '-' ? move.power : '—' }}
      </div>

      <div class="w-16 text-center text-gray-600 font-mono">
        {{ move.pp || '—' }}
      </div>

      <div class="w-16 text-center text-gray-600 font-mono">
        {{ formatAccuracy(move.accuracy) }}
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

    <!-- Versión Mobile: Card -->
    <div v-else class="p-4 border-b border-gray-200">
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span
              :class="formatTipos(move.type).color"
              class="px-2 py-1 rounded-full text-white text-xs"
            >
              {{ formatTipos(move.type).tipo }}
            </span>
            <span
              :class="getCategoryColor(move.category)"
              class="px-2 py-1 rounded-full text-white text-xs inline-flex items-center gap-1"
            >
              <img
                v-if="CATEGORY_ICON[move.category]"
                :src="CATEGORY_ICON[move.category]"
                :alt="move.category"
                class="h-4 w-4"
              />
              {{ CATEGORY_LABEL[move.category] ?? move.category }}
            </span>
            <span :class="getLevelDisplay(move).classes" class="px-2 py-1 rounded text-xs">
              {{ getLevelDisplay(move).label }}
            </span>
          </div>
          <h3 class="font-bold text-gray-800 text-lg">
            {{ formatName(move.name) }}
          </h3>
        </div>
        <button
          @click="emit('toggle-details', move.name)"
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition"
          :aria-label="expandedMove === move.name ? 'Ocultar detalles' : 'Mostrar detalles'"
        >
          <span class="text-gray-500 text-xl">
            {{ expandedMove === move.name ? '▲' : '▼' }}
          </span>
        </button>
      </div>

      <div class="grid grid-cols-3 gap-3 text-sm">
        <div>
          <span class="text-gray-500 block text-xs">Poder</span>
          <span class="font-mono font-semibold">{{
            move.power && move.power !== '-' ? move.power : '—'
          }}</span>
        </div>
        <div>
          <span class="text-gray-500 block text-xs">PP</span>
          <span class="font-mono font-semibold">{{ move.pp || '—' }}</span>
        </div>
        <div>
          <span class="text-gray-500 block text-xs">Precisión</span>
          <span class="font-mono font-semibold">{{ formatAccuracy(move.accuracy) }}</span>
        </div>
      </div>
    </div>

    <MoveDetails v-if="expandedMove === move.name" :move="move" />
  </div>
</template>
