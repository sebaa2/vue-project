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
})

const expandedMove = ref(null)

const toggleMoveDetails = (moveName) => {
  expandedMove.value = expandedMove.value === moveName ? null : moveName
}
</script>

<template>
  <div>
    <MoveFilters
      :tipoOptions="tipoOptions"
      :categoriaOptions="categoriaOptions"
      :totalMoves="totalMoves"
      :filteredCount="filteredCount"
      :isSearchActive="isSearchActive"
    />

    <MoveTableHeader />

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
            @click="$emit('reset-filters')"
            class="ml-2 text-blue-500 hover:text-blue-700"
          >
            Limpiar filtros
          </button>
        </div>
      </template>
    </VirtualScroller>
  </div>
</template>