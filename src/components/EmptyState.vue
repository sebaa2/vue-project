<!-- src/components/EmptyState.vue -->
<template>
  <div class="text-center py-20">
    <div class="text-6xl mb-4">🔍</div>
    <h3 class="text-xl font-semibold text-gray-600 mb-2">
      No se encontraron Pokémon
    </h3>
    <p class="text-gray-400 mb-4">
      Intenta con otra búsqueda o revisa los filtros
    </p>
    <button
      @click="$emit('reset')"
      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Limpiar filtros
    </button>
  </div>
</template>

<script setup>
defineEmits(['reset'])
</script>