<!-- components/moves/MoveDetails.vue -->
<script setup>
defineProps({
  move: Object,
})
</script>

<template>
  <div class="px-3 pb-3">
    <div class="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border-l-4 border-blue-400">
      <p v-if="move.effect && move.effect !== 'Sin descripción disponible'">
        <span class="font-semibold">🎯 Efecto: </span>{{ move.effect }}
      </p>
      <p v-else-if="move.effect === 'Sin descripción disponible'" class="italic text-gray-400">
        📝 No hay descripción disponible en español para este movimiento.
      </p>
      <p v-else class="italic text-gray-400">🔄 Cargando descripción...</p>

      <div v-if="move.accuracy || move.priority" class="mt-2 flex gap-4 text-xs text-gray-500">
        <span v-if="move.accuracy && move.accuracy !== '-'">
          🎯 Precisión: {{ move.accuracy }}%
        </span>
        <span v-if="move.priority && move.priority !== 0">
          ⚡ Prioridad: {{ move.priority > 0 ? `+${move.priority}` : move.priority }}
        </span>
      </div>

      <div v-if="move.originalName && move.originalName !== move.name" class="mt-2 text-xs text-gray-400">
        Nombre original: {{ move.originalName }}
      </div>
    </div>
  </div>
</template>