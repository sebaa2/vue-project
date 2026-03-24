<!-- components/moves/MoveFilters.vue -->
<script setup>
import { storeToRefs } from 'pinia'
import { useSearchStore } from '../../stores/searchStore.js'

const searchStore = useSearchStore()
const {
  searchTerm,
  selectedType,
  selectedCategory,
  sortBy,
  sortOrder,
  isTyping,
} = storeToRefs(searchStore)

const {
  setSearchTerm,
  setSelectedType,
  setSelectedCategory,
  toggleSortOrder,
  resetFilters,
} = searchStore

defineProps({
  tipoOptions: Array,
  categoriaOptions: Array,
  totalMoves: Number,
  filteredCount: Number,
  isSearchActive: Boolean,
})
</script>

<template>
  <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
    <h2 class="text-2xl font-bold">Movimientos</h2>
    <div v-if="isSearchActive" class="text-sm text-gray-500">
      {{ filteredCount }} / {{ totalMoves }} movimientos
      <button @click="resetFilters" class="ml-2 text-red-500 hover:text-red-700">
        ✕ Limpiar
      </button>
    </div>
  </div>

  <div class="mb-4 flex flex-wrap gap-2">
    <div class="relative">
      <input
        :value="searchTerm"
        @input="(e) => setSearchTerm(e.target.value)"
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
      @change="(e) => setSelectedType(e.target.value)"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option v-for="option in tipoOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <select
      :value="selectedCategory"
      @change="(e) => setSelectedCategory(e.target.value)"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option v-for="option in categoriaOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <button
      @click="toggleSortOrder"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm hover:bg-gray-50"
    >
      Ordenar
      {{ sortBy === 'name' ? 'por nombre' : sortBy === 'power' ? 'por poder' : 'por PP' }}
      {{ sortOrder === 'asc' ? '↑' : '↓' }}
    </button>
  </div>
</template>