<!-- components/moves/MoveDetails.vue -->
<script setup>
const props = defineProps({
  move: Object,
})

// Genera un mensaje descriptivo sobre cómo se aprende el movimiento
const learnMethodInfo = computed(() => {
  const method = props.move?.learnMethod
  const level = props.move?.levelLearnedAt

  if (method === 'level-up' && level === 0) {
    return {
      icon: '🔄',
      text: 'Este movimiento se aprende al evolucionar al Pokémon.',
      classes: 'text-purple-700 bg-purple-50 border-purple-300',
    }
  }
  if (method === 'level-up' && level > 0) {
    return {
      icon: '📈',
      text: `Se aprende al subir al nivel ${level}.`,
      classes: 'text-blue-700 bg-blue-50 border-blue-300',
    }
  }
  if (method === 'machine') {
    return {
      icon: '💿',
      text: 'Se aprende mediante una MT o MO.',
      classes: 'text-yellow-700 bg-yellow-50 border-yellow-300',
    }
  }
  if (method === 'egg') {
    return {
      icon: '🥚',
      text: 'Se aprende como movimiento huevo (crianza).',
      classes: 'text-orange-700 bg-orange-50 border-orange-300',
    }
  }
  if (method === 'tutor') {
    return {
      icon: '👨‍🏫',
      text: 'Se aprende a través de un tutor de movimientos.',
      classes: 'text-green-700 bg-green-50 border-green-300',
    }
  }
  return null
})
</script>

<script>
import { computed } from 'vue'
</script>

<template>
  <div class="px-3 pb-3 flex flex-col gap-2">
    <!-- Método de aprendizaje -->
    <div
      v-if="learnMethodInfo"
      :class="learnMethodInfo.classes"
      class="rounded-lg px-3 py-2 text-sm border-l-4 flex items-start gap-2"
    >
      <span>{{ learnMethodInfo.icon }}</span>
      <span>{{ learnMethodInfo.text }}</span>
    </div>

    <!-- Efecto / descripción -->
    <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border-l-4 border-blue-400">
      <p v-if="move.effect && move.effect !== 'Sin descripción disponible'">
        <span class="font-semibold">🎯 Efecto: </span>{{ move.effect }}
      </p>
      <p v-else-if="move.effect === 'Sin descripción disponible'" class="italic text-gray-400">
        📝 No hay descripción disponible en español para este movimiento.
      </p>
      <p v-else class="italic text-gray-400">🔄 Cargando descripción...</p>

      <div
        v-if="move.originalName && move.originalName !== move.name"
        class="mt-2 text-xs text-gray-400"
      >
        Nombre original: {{ move.originalName }}
      </div>
    </div>
  </div>
</template>
