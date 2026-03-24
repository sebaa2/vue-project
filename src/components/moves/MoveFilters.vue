<!-- components/moves/MoveFilters.vue -->
<script setup>
const props = defineProps({
  tipoOptions: Array,
  categoriaOptions: Array,
  totalMoves: Number,
  filteredCount: Number,
  isSearchActive: Boolean,
  searchTerm: String,
  selectedType: String,
  selectedCategory: String,
  sortBy: String,
  sortOrder: String,
  isTyping: Boolean,
})

const emit = defineEmits([
  'update:searchTerm',
  'update:selectedType',
  'update:selectedCategory',
  'toggleSortOrder',
  'resetFilters',
  'setSortBy',
])

// Manejadores locales
const handleSearchInput = (event) => {
  emit('update:searchTerm', event.target.value)
}

const handleTypeChange = (event) => {
  emit('update:selectedType', event.target.value)
}

const handleCategoryChange = (event) => {
  emit('update:selectedCategory', event.target.value)
}

const handleSortByChange = (event) => {
  emit('setSortBy', event.target.value)
}

const handleToggleSortOrder = () => {
  emit('toggleSortOrder')
}

const handleResetFilters = () => {
  emit('resetFilters')
}

// Helper para mostrar el label del ordenamiento
const getSortLabel = () => {
  if (props.sortBy === 'name') return 'por nombre'
  if (props.sortBy === 'power') return 'por poder'
  if (props.sortBy === 'pp') return 'por PP'
  if (props.sortBy === 'accuracy') return 'por precisión'
  return 'por nombre'
}
</script>

<template>
  <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
    <h2 class="text-2xl font-bold">Movimientos</h2>
    <div v-if="isSearchActive" class="text-sm text-gray-500">
      {{ filteredCount }} / {{ totalMoves }} movimientos
      <button @click="handleResetFilters" class="ml-2 text-red-500 hover:text-red-700">
        ✕ Limpiar
      </button>
    </div>
  </div>

  <div class="mb-4 flex flex-wrap gap-2">
    <div class="relative">
      <input
        :value="searchTerm"
        @input="handleSearchInput"
        type="text"
        placeholder="🔍 Buscar movimiento..."
        class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
      />
      <div v-if="isTyping" class="absolute right-2 top-1/2 transform -translate-y-1/2">
        <div class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    </div>

    <select
      :value="selectedType"
      @change="handleTypeChange"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option v-for="option in tipoOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <select
      :value="selectedCategory"
      @change="handleCategoryChange"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option v-for="option in categoriaOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <select
      :value="sortBy"
      @change="handleSortByChange"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option value="name">Ordenar por nombre</option>
      <option value="power">Ordenar por poder</option>
      <option value="pp">Ordenar por PP</option>
      <option value="accuracy">Ordenar por precisión</option>
    </select>

    <button
      @click="handleToggleSortOrder"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:bg-gray-50"
    >
      {{ sortOrder === 'asc' ? '↑ Ascendente' : '↓ Descendente' }}
    </button>
  </div>
</template>