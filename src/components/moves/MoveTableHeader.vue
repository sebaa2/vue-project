<!-- components/moves/MoveTableHeader.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { formatTipos } from '../../config/arrayTipo.js'

const props = defineProps({
  sortBy: String,
  sortOrder: String,
  selectedType: String,
  selectedCategory: String,
  selectedMethod: String,
  tipoOptions: Array,
  categoriaOptions: Array,
  methodOptions: Array,
})

const emit = defineEmits([
  'update:sort',
  'update:selectedType',
  'update:selectedCategory',
  'update:selectedMethod',
])

// Estado para responsividad
const isMobile = ref(false)

// Estados para los menús desplegables
const showTypeMenu = ref(false)
const showCategoryMenu = ref(false)
const showMethodMenu = ref(false)

// Detectar tamaño de pantalla
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}

// Manejar ordenamiento con ciclo: ascendente -> descendente -> desactivado
const handleSetSortBy = (sortByValue) => {
  // Si es el método "level-up", ordenar por nivel
  if (sortByValue === 'level' && props.selectedMethod === 'level-up') {
    if (props.sortBy === 'level') {
      if (props.sortOrder === 'asc') {
        emit('update:sort', { sortBy: 'level', sortOrder: 'desc' })
      } else if (props.sortOrder === 'desc') {
        emit('update:sort', { sortBy: null, sortOrder: 'asc' })
      }
    } else {
      emit('update:sort', { sortBy: 'level', sortOrder: 'asc' })
    }
    return
  }

  // Para otros tipos de ordenamiento
  if (props.sortBy === sortByValue) {
    if (props.sortOrder === 'asc') {
      emit('update:sort', { sortBy: sortByValue, sortOrder: 'desc' })
    } else if (props.sortOrder === 'desc') {
      emit('update:sort', { sortBy: null, sortOrder: 'asc' })
    }
  } else {
    emit('update:sort', { sortBy: sortByValue, sortOrder: 'asc' })
  }
}

// Manejar selección de método
const handleSelectMethod = (methodValue) => {
  if (props.selectedMethod === methodValue) {
    emit('update:selectedMethod', 'all')
    // Si se deselecciona el método "level-up", resetear el ordenamiento por nivel
    if (methodValue === 'level-up') {
      emit('update:sort', { sortBy: null, sortOrder: 'asc' })
    }
  } else {
    emit('update:selectedMethod', methodValue)
    // Si se selecciona el método "level-up", activar ordenamiento por nivel automáticamente
    if (methodValue === 'level-up') {
      emit('update:sort', { sortBy: 'level', sortOrder: 'asc' })
    }
  }
  showMethodMenu.value = false
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

// Función para obtener el color del método
const getMethodColor = (methodValue) => {
  const colors = {
    'level-up': 'bg-green-500',
    machine: 'bg-blue-500',
    egg: 'bg-purple-500',
    tutor: 'bg-orange-500',
  }
  return colors[methodValue] || 'bg-gray-500'
}

// Cerrar menús al hacer clic fuera
const handleClickOutside = (event) => {
  const typeButton = document.getElementById('type-button')
  const categoryButton = document.getElementById('category-button')
  const methodButton = document.getElementById('method-button')
  const typeMenu = document.getElementById('type-menu')
  const categoryMenu = document.getElementById('category-menu')
  const methodMenu = document.getElementById('method-menu')

  if (
    typeButton &&
    !typeButton.contains(event.target) &&
    typeMenu &&
    !typeMenu.contains(event.target)
  ) {
    showTypeMenu.value = false
  }
  if (
    categoryButton &&
    !categoryButton.contains(event.target) &&
    categoryMenu &&
    !categoryMenu.contains(event.target)
  ) {
    showCategoryMenu.value = false
  }
  if (
    methodButton &&
    !methodButton.contains(event.target) &&
    methodMenu &&
    !methodMenu.contains(event.target)
  ) {
    showMethodMenu.value = false
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <!-- Versión Desktop: Header con columnas -->
  <div
    v-if="!isMobile"
    class="flex items-center p-3 gap-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg font-semibold text-gray-700 border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm"
  >
    <!-- Tipo -->
    <div class="w-24 text-sm relative">
      <button
        id="type-button"
        @click.stop="showTypeMenu = !showTypeMenu"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full text-left"
        :class="{ 'text-blue-600 font-bold': selectedType !== 'all' }"
      >
        Tipo
        <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

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
          <span
            v-if="option.value !== 'all'"
            class="w-3 h-3 rounded-full"
            :class="getTypeColor(option.value)"
          ></span>
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Categoría -->
    <div class="w-28 text-sm relative">
      <button
        id="category-button"
        @click.stop="showCategoryMenu = !showCategoryMenu"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full text-left"
        :class="{ 'text-blue-600 font-bold': selectedCategory !== 'all' }"
      >
        Categoría
        <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

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

    <!-- Movimiento -->
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

    <!-- Método -->
    <div class="w-28 text-sm relative">
      <button
        id="method-button"
        @click.stop="showMethodMenu = !showMethodMenu"
        class="hover:text-blue-600 transition-colors inline-flex items-center gap-1 w-full text-left justify-center"
        :class="{ 'text-blue-600 font-bold': selectedMethod !== 'all' }"
      >
        Método
        <svg class="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        v-if="showMethodMenu"
        id="method-menu"
        class="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
      >
        <button
          v-for="option in methodOptions"
          :key="option.value"
          @click="handleSelectMethod(option.value)"
          class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
          :class="{ 'bg-blue-50 text-blue-600 font-semibold': selectedMethod === option.value }"
        >
          <span
            class="w-3 h-3 rounded-full"
            :class="option.value !== 'all' ? getMethodColor(option.value) : 'bg-gray-300'"
          ></span>
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Poder -->
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

    <!-- PP -->
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

    <!-- Precisión -->
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

  <!-- Versión Mobile: Filtros compactos -->
  <div
    v-else
    class="bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-lg p-3 border-b-2 border-gray-200 sticky top-0 z-10 shadow-sm"
  >
    <div class="grid grid-cols-2 gap-2">
      <!-- Filtro Tipo -->
      <div class="relative">
        <button
          id="type-button-mobile"
          @click.stop="showTypeMenu = !showTypeMenu"
          class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-between"
          :class="{ 'border-blue-500 bg-blue-50': selectedType !== 'all' }"
        >
          <span>Tipo</span>
          <span
            v-if="selectedType !== 'all'"
            class="text-xs px-2 py-0.5 rounded-full text-white"
            :class="getTypeColor(selectedType)"
          >
            {{ tipoOptions.find((opt) => opt.value === selectedType)?.label || selectedType }}
          </span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          v-if="showTypeMenu"
          id="type-menu-mobile"
          class="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 max-h-60 overflow-y-auto"
        >
          <button
            v-for="option in tipoOptions"
            :key="option.value"
            @click="handleSelectType(option.value)"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            :class="{ 'bg-blue-50 text-blue-600 font-semibold': selectedType === option.value }"
          >
            <span
              v-if="option.value !== 'all'"
              class="w-3 h-3 rounded-full"
              :class="getTypeColor(option.value)"
            ></span>
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Filtro Categoría -->
      <div class="relative">
        <button
          id="category-button-mobile"
          @click.stop="showCategoryMenu = !showCategoryMenu"
          class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-between"
          :class="{ 'border-blue-500 bg-blue-50': selectedCategory !== 'all' }"
        >
          <span>Categoría</span>
          <span
            v-if="selectedCategory !== 'all'"
            class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
          >
            {{
              categoriaOptions.find((opt) => opt.value === selectedCategory)?.label ||
              selectedCategory
            }}
          </span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          v-if="showCategoryMenu"
          id="category-menu-mobile"
          class="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
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

      <!-- Filtro Método -->
      <div class="relative">
        <button
          id="method-button-mobile"
          @click.stop="showMethodMenu = !showMethodMenu"
          class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-between"
          :class="{ 'border-blue-500 bg-blue-50': selectedMethod !== 'all' }"
        >
          <span>Método</span>
          <span
            v-if="selectedMethod !== 'all'"
            class="text-xs px-2 py-0.5 rounded-full text-white"
            :class="getMethodColor(selectedMethod)"
          >
            {{ methodOptions.find((opt) => opt.value === selectedMethod)?.label || selectedMethod }}
          </span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        <div
          v-if="showMethodMenu"
          id="method-menu-mobile"
          class="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
        >
          <button
            v-for="option in methodOptions"
            :key="option.value"
            @click="handleSelectMethod(option.value)"
            class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2"
            :class="{ 'bg-blue-50 text-blue-600 font-semibold': selectedMethod === option.value }"
          >
            <span
              class="w-3 h-3 rounded-full"
              :class="option.value !== 'all' ? getMethodColor(option.value) : 'bg-gray-300'"
            ></span>
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Ordenamiento -->
      <div class="relative">
        <button
          @click="handleSetSortBy('name')"
          class="w-full px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 hover:border-blue-400 transition-colors flex items-center justify-between"
          :class="{ 'border-blue-500 bg-blue-50': sortBy === 'name' }"
        >
          <span>Ordenar por</span>
          <span class="text-xs text-gray-600">
            {{ sortBy === 'name' ? `Nombre ${sortOrder === 'asc' ? '↑' : '↓'}` : 'Nombre' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
