<!-- components/moves/MoveTableHeader.vue -->
<script setup>
import { ref } from 'vue'
import { formatTipos } from '../../config/arrayTipo.js'

const props = defineProps({
  sortBy: String,
  sortOrder: String,
  selectedType: String,
  selectedCategory: String,
  tipoOptions: Array,
  categoriaOptions: Array,
})

const emit = defineEmits(['update:sort', 'update:selectedType', 'update:selectedCategory'])

// Estados para los menús desplegables
const showTypeMenu = ref(false)
const showCategoryMenu = ref(false)

// Manejar ordenamiento con ciclo: ascendente -> descendente -> desactivado
const handleSetSortBy = (sortByValue) => {
  if (props.sortBy === sortByValue) {
    // Si ya está ordenado por esta columna
    if (props.sortOrder === 'asc') {
      // Si está ascendente, cambiar a descendente
      emit('update:sort', { sortBy: sortByValue, sortOrder: 'desc' })
    } else if (props.sortOrder === 'desc') {
      // Si está descendente, desactivar ordenamiento
      emit('update:sort', { sortBy: null, sortOrder: 'asc' })
    }
  } else {
    // Si es una columna nueva, ordenar ascendente
    emit('update:sort', { sortBy: sortByValue, sortOrder: 'asc' })
  }
}

// Manejar selección de tipo
const handleSelectType = (typeValue) => {
  if (props.selectedType === typeValue) {
    emit('update:selectedType', 'all')
  } else {
    emit('update:selectedType', typeValue)
  }
  showTypeMenu.value = false
}

// Manejar selección de categoría
const handleSelectCategory = (categoryValue) => {
  if (props.selectedCategory === categoryValue) {
    emit('update:selectedCategory', 'all')
  } else {
    emit('update:selectedCategory', categoryValue)
  }
  showCategoryMenu.value = false
}

// Función para obtener el color del tipo
const getTypeColor = (typeValue) => {
  if (typeValue === 'all') return ''
  const formatted = formatTipos(typeValue)
  return formatted.color
}

// Cerrar menús al hacer clic fuera
const handleClickOutside = (event) => {
  const typeButton = document.getElementById('type-button')
  const categoryButton = document.getElementById('category-button')
  const typeMenu = document.getElementById('type-menu')
  const categoryMenu = document.getElementById('category-menu')
  
  if (typeButton && !typeButton.contains(event.target) && typeMenu && !typeMenu.contains(event.target)) {
    showTypeMenu.value = false
  }
  if (categoryButton && !categoryButton.contains(event.target) && categoryMenu && !categoryMenu.contains(event.target)) {
    showCategoryMenu.value = false
  }
}

// Agregar event listener para cerrar menús
if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}
</script>

<template>
  <div
    class="flex items-center p-3 gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg font-semibold text-gray-700 border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm"
  >
    <!-- Tipo - Menú desplegable -->
    <div class="w-24 text-sm relative">
      <button
        id="type-button"
        @click.stop="showTypeMenu = !showTypeMenu"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full text-left"
        :class="{ 'text-blue-600 font-bold': selectedType !== 'all' }"
      >
        Tipo
        <span 
          v-if="selectedType !== 'all'" 
          class="text-xs px-1 rounded ml-1 text-white" 
          :class="getTypeColor(selectedType)"
        >
          {{ tipoOptions.find(opt => opt.value === selectedType)?.label || selectedType }}
        </span>
        <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Menú desplegable de tipos -->
      <div
        v-if="showTypeMenu"
        id="type-menu"
        class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-60 overflow-y-auto"
      >
        <button
          v-for="option in tipoOptions"
          :key="option.value"
          @click="handleSelectType(option.value)"
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          :class="{ 'bg-blue-50 text-blue-600 font-semibold': selectedType === option.value }"
        >
          <span v-if="option.value !== 'all'" class="w-3 h-3 rounded-full" :class="getTypeColor(option.value)"></span>
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Categoría - Menú desplegable -->
    <div class="w-28 text-sm relative">
      <button
        id="category-button"
        @click.stop="showCategoryMenu = !showCategoryMenu"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full text-left"
        :class="{ 'text-blue-600 font-bold': selectedCategory !== 'all' }"
      >
        Categoría
        <span v-if="selectedCategory !== 'all'" class="text-xs bg-blue-100 text-blue-700 px-1 rounded ml-1">
          {{ categoriaOptions.find(opt => opt.value === selectedCategory)?.label || selectedCategory }}
        </span>
        <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Menú desplegable de categorías -->
      <div
        v-if="showCategoryMenu"
        id="category-menu"
        class="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
      >
        <button
          v-for="option in categoriaOptions"
          :key="option.value"
          @click="handleSelectCategory(option.value)"
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50 text-blue-600 font-semibold': selectedCategory === option.value }"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Movimiento - Click para ordenar (con ciclo) -->
    <div class="flex-1 text-sm">
      <button
        @click="handleSetSortBy('name')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
        :class="{ 'text-blue-600 font-bold': sortBy === 'name' }"
      >
        Movimiento
        <span v-if="sortBy === 'name'" class="text-xs ml-1">
          {{ sortOrder === 'asc' ? '↓' : '↑' }}
        </span>
      </button>
    </div>

    <!-- Nivel - Click para ordenar (con ciclo) -->
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('levelLearnedAt')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full justify-center"
        :class="{ 'text-blue-600 font-bold': sortBy === 'levelLearnedAt' }"
      >
        Nivel
        <span v-if="sortBy === 'levelLearnedAt'" class="text-xs ml-1">
          {{ sortOrder === 'asc' ? '↓' : '↑' }}
        </span>
      </button>
    </div>

    <!-- Poder - Click para ordenar (con ciclo) -->
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('power')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full justify-center"
        :class="{ 'text-blue-600 font-bold': sortBy === 'power' }"
      >
        Poder
        <span v-if="sortBy === 'power'" class="text-xs ml-1">
          {{ sortOrder === 'asc' ? '↓' : '↑' }}
        </span>
      </button>
    </div>

    <!-- PP - Click para ordenar (con ciclo) -->
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('pp')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full justify-center"
        :class="{ 'text-blue-600 font-bold': sortBy === 'pp' }"
      >
        PP
        <span v-if="sortBy === 'pp'" class="text-xs ml-1">
          {{ sortOrder === 'asc' ? '↓' : '↑' }}
        </span>
      </button>
    </div>

    <!-- Precisión - Click para ordenar (con ciclo) -->
    <div class="w-16 text-center text-sm">
      <button
        @click="handleSetSortBy('accuracy')"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full justify-center"
        :class="{ 'text-blue-600 font-bold': sortBy === 'accuracy' }"
      >
        Precisión
        <span v-if="sortBy === 'accuracy'" class="text-xs ml-1">
          {{ sortOrder === 'asc' ? '↓' : '↑' }}
        </span>
      </button>
    </div>
    
    <div class="w-8"></div>
  </div>
</template>