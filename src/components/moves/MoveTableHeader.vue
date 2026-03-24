<!-- components/moves/MoveTableHeader.vue -->
<script setup>
defineProps({
  sortBy: String,
  sortOrder: String,
})

const emit = defineEmits(['setSortBy'])

const handleSetSortBy = (sortByValue) => {
  emit('setSortBy', sortByValue)
}
</script>

<template>
  <div
    class="flex items-center p-3 gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg font-semibold text-gray-700 border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm"
  >
    <div class="w-24 text-sm">Tipo</div>
    <div class="w-28 text-sm">Categoría</div>
    <div class="flex-1 text-sm">Movimiento</div>
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('levelLearnedAt')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
      >
        Nivel
        <span v-if="sortBy === 'levelLearnedAt'" class="text-xs">{{
          sortOrder === 'asc' ? '↑' : '↓'
        }}</span>
      </button>
    </div>
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('power')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
      >
        Poder
        <span v-if="sortBy === 'power'" class="text-xs">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
      </button>
    </div>
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('pp')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
      >
        PP
        <span v-if="sortBy === 'pp'" class="text-xs">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
      </button>
    </div>
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('accuracy')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
      >
        Precisión
        <span v-if="sortBy === 'accuracy'" class="text-xs">{{
          sortOrder === 'asc' ? '↑' : '↓'
        }}</span>
      </button>
    </div>
    <div class="w-8"></div>
  </div>
</template>
