<!-- src/components/PokemonPagination.vue -->
<template>
  <div class="mt-8 flex flex-wrap justify-center gap-2">
    <button
      @click="$emit('pageChange', currentPage - 1)"
      :disabled="currentPage === 1"
      class="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      ← Anterior
    </button>

    <div class="flex gap-1 flex-wrap justify-center">
      <template v-for="page in visiblePages" :key="page">
        <button
          v-if="page !== '...'"
          @click="$emit('pageChange', page)"
          :class="[
            'px-3 py-2 rounded-lg border transition-colors',
            currentPage === page
              ? 'bg-red-600 text-white border-red-600'
              : 'border-gray-300 hover:bg-gray-100'
          ]"
        >
          {{ page }}
        </button>
        <span v-else class="px-3 py-2 text-gray-500">...</span>
      </template>
    </div>

    <button
      @click="$emit('pageChange', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      Siguiente →
    </button>
  </div>

  <!-- Selector de items por página -->
  <div class="mt-4 flex justify-center">
    <select
      :value="itemsPerPage"
      @change="$emit('updateItemsPerPage', parseInt($event.target.value))"
      class="px-3 py-1 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
    >
      <option :value="12">12 por página</option>
      <option :value="24">24 por página</option>
      <option :value="48">48 por página</option>
      <option :value="96">96 por página</option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  visiblePages: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 24
  }
})

defineEmits(['pageChange', 'updateItemsPerPage'])
</script>