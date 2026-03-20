// stores/searchStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSearchStore = defineStore(
  'search',
  () => {
    // ==================== STATE ====================
    const searchTerm = ref('')
    const selectedType = ref('all')
    const selectedCategory = ref('all')
    const sortBy = ref('name')
    const sortOrder = ref('asc')
    const currentPage = ref(1)
    const itemsPerPage = ref(10)

    // ==================== GETTERS ====================
    const isSearchActive = computed(() => {
      return (
        searchTerm.value !== '' || selectedType.value !== 'all' || selectedCategory.value !== 'all'
      )
    })

    // ==================== ACTIONS ====================
    const resetFilters = () => {
      searchTerm.value = ''
      selectedType.value = 'all'
      selectedCategory.value = 'all'
      sortBy.value = 'name'
      sortOrder.value = 'asc'
      currentPage.value = 1
    }

    const clearSearch = () => {
      searchTerm.value = ''
      currentPage.value = 1
    }

    const setSearchTerm = (term) => {
      searchTerm.value = term
      currentPage.value = 1 // Resetear página al buscar
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
      searchTerm,
      selectedType,
      selectedCategory,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage,
      // getters
      isSearchActive,
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
        'searchTerm',
        'selectedType',
        'selectedCategory',
        'sortBy',
        'sortOrder',
        'itemsPerPage',
      ],
      // currentPage NO se persiste porque siempre debe empezar desde 1
    },
  },
)
