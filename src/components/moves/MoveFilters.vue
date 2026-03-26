<!-- components/moves/MoveFilters.vue -->
<script setup>
const props = defineProps({
  totalMoves: Number,
  filteredCount: Number,
  isSearchActive: Boolean,
  searchTerm: String,
  isTyping: Boolean,
})

const emit = defineEmits([
  'update:searchTerm',
  'resetFilters',
])

const handleSearchInput = (event) => {
  emit('update:searchTerm', event.target.value)
}

const handleResetFilters = () => {
  emit('resetFilters')
}
</script>

<template>
  <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
    <h2 class="text-2xl font-bold">Movimientos</h2>
    <div v-if="isSearchActive" class="text-sm text-gray-500">
      {{ filteredCount }} / {{ totalMoves }} movimientos
      <button @click="handleResetFilters" class="ml-2 text-red-500 hover:text-red-700">
        ✕ Limpiar filtros
      </button>
    </div>
  </div>

  <div class="mb-4">
    <div class="relative">
      <input
        :value="searchTerm"
        @input="handleSearchInput"
        type="text"
        placeholder="🔍 Buscar por nombre..."
        class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8 w-full md:w-64"
      />
      <div v-if="isTyping" class="absolute right-2 top-1/2 transform -translate-y-1/2">
        <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    </div>
  </div>
</template>