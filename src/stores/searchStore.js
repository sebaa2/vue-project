// stores/searchStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Implementación simple de debounce
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

export const useSearchStore = defineStore(
  'search',
  () => {
    // ==================== STATE ====================
    const searchTerm = ref('')
    const searchTermDebounced = ref('') // Término real para filtrar
    const selectedType = ref('all')
    const selectedCategory = ref('all')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)
    const isTyping = ref(false) // Indicador de escritura

    // ==================== GETTERS ====================
    const isSearchActive = computed(() => {
      return (
        searchTermDebounced.value !== '' ||
        selectedType.value !== 'all' ||
        selectedCategory.value !== 'all'
      )
    })

    // Término real para usar en filtros (el debounced)
    const effectiveSearchTerm = computed(() => searchTermDebounced.value)

    // ==================== ACTIONS ====================
    const resetFilters = () => {
      searchTerm.value = ''
      searchTermDebounced.value = ''
      selectedType.value = 'all'
      selectedCategory.value = 'all'
      sortBy.value = 'name'
      sortOrder.value = 'asc'
      currentPage.value = 1
      isTyping.value = false
    }

    const clearSearch = () => {
      searchTerm.value = ''
      searchTermDebounced.value = ''
      currentPage.value = 1
    }

    // Función que actualiza el término de búsqueda con debounce
    const updateSearchTerm = (term) => {
      searchTerm.value = term
      isTyping.value = true

      // Debounce para actualizar el término real
      debouncedSetEffectiveTerm(term)
    }

    // Función debounced que actualiza el término real
    const setEffectiveTerm = (term) => {
      searchTermDebounced.value = term
      currentPage.value = 1
      isTyping.value = false
    }

    const debouncedSetEffectiveTerm = debounce(setEffectiveTerm, 300)

    // Para compatibilidad con código existente
    const setSearchTerm = (term) => {
      updateSearchTerm(term)
    }

    const setSelectedType = (type) => {
      selectedType.value = type
      currentPage.value = 1
    }

    const setSelectedCategory = (category) => {
      selectedCategory.value = category
      currentPage.value = 1
    }

    const setSortBy = (sort) => {
      sortBy.value = sort
    }

    const toggleSortOrder = () => {
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }

    const setCurrentPage = (page) => {
      currentPage.value = page
    }

    const setItemsPerPage = (items) => {
      itemsPerPage.value = items
      currentPage.value = 1
    }

    return {
      // state
      searchTerm, // Para el input (actualización inmediata)
      searchTermDebounced, // Para filtrar (actualización con debounce)
      selectedType,
      selectedCategory,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage,
      isTyping,
      // getters
      isSearchActive,
      effectiveSearchTerm,
      // actions
      resetFilters,
      clearSearch,
      setSearchTerm,
      setSelectedType,
      setSelectedCategory,
      setSortBy,
      toggleSortOrder,
      setCurrentPage,
      setItemsPerPage,
    }
  },
  {
    persist: {
      key: 'search-store',
      storage: localStorage,
      paths: [
        'searchTermDebounced', // Persistir el término debounced
        'selectedType',
        'selectedCategory',
        'sortBy',
        'sortOrder',
        'itemsPerPage',
      ],
      // searchTerm y currentPage no se persisten
    },
  },
)
