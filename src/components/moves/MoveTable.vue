<!-- components/moves/MoveTable.vue -->
<script setup>
import { ref } from 'vue'
import VirtualScroller from 'primevue/virtualscroller'
import MoveFilters from './MoveFilters.vue'
import MoveTableHeader from './MoveTableHeader.vue'
import MoveRow from './MoveRow.vue'

const props = defineProps({
  moves: Array,
  totalMoves: Number,
  filteredCount: Number,
  isSearchActive: Boolean,
  tipoOptions: Array,
  categoriaOptions: Array,
  methodOptions: Array, // Nuevo
  searchTerm: String,
  selectedType: String,
  selectedCategory: String,
  selectedMethod: String, // Nuevo
  sortBy: String,
  sortOrder: String,
  isTyping: Boolean,
})

const emit = defineEmits([
  'update:searchTerm',
  'update:selectedType',
  'update:selectedCategory',
  'update:selectedMethod', // Nuevo
  'update:sort',
  'resetFilters',
])

const expandedMove = ref(null)

const toggleMoveDetails = (moveName) => {
  expandedMove.value = expandedMove.value === moveName ? null : moveName
}

const handleUpdateSort = (sortData) => {
  emit('update:sort', sortData)
}

const handleResetFilters = () => {
  emit('resetFilters')
}
</script>

<template>
  <div>
    <MoveFilters
      :totalMoves="totalMoves"
      :filteredCount="filteredCount"
      :isSearchActive="isSearchActive"
      :searchTerm="searchTerm"
      :isTyping="isTyping"
      @update:search-term="(value) => emit('update:searchTerm', value)"
      @reset-filters="handleResetFilters"
    />

    <MoveTableHeader
      :sortBy="sortBy"
      :sortOrder="sortOrder"
      :selectedType="selectedType"
      :selectedCategory="selectedCategory"
      :selectedMethod="selectedMethod"
      :tipoOptions="tipoOptions"
      :categoriaOptions="categoriaOptions"
      :methodOptions="methodOptions"
      @update:sort="handleUpdateSort"
      @update:selected-type="(value) => emit('update:selectedType', value)"
      @update:selected-category="(value) => emit('update:selectedCategory', value)"
      @update:selected-method="(value) => emit('update:selectedMethod', value)"
    />

    <VirtualScroller
      :items="moves"
      :itemSize="70"
      :buffer="3"
      class="border border-gray-200 border-t-0 rounded-b-lg overflow-hidden"
      style="height: 500px"
    >
      <template #item="{ item, index }">
        <MoveRow
          :move="item"
          :index="index"
          :expandedMove="expandedMove"
          @toggle-details="toggleMoveDetails"
        />
      </template>

      <template #empty>
        <div class="flex items-center justify-center h-32 text-gray-500">
          No se encontraron movimientos.
          <button
            v-if="isSearchActive"
            @click="handleResetFilters"
            class="ml-2 text-blue-500 hover:text-blue-700"
          >
            Limpiar filtros
          </button>
        </div>
      </template>
    </VirtualScroller>
  </div>
</template>