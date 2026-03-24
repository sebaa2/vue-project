// composables/usePokemonPagination.js
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export function usePokemonPagination(items, defaultItemsPerPage = 24) {
  
  // Estado
  const currentPage = ref(1)
  const itemsPerPage = useLocalStorage('pokedex-items-per-page', defaultItemsPerPage)
  
  // Computados
  const totalItems = computed(() => items.value?.length || 0)
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => startIndex.value + itemsPerPage.value)
  
  const paginatedItems = computed(() => {
    if (!items.value) return []
    return items.value.slice(startIndex.value, endIndex.value)
  })
  
  // Páginas visibles con elipses
  const visiblePages = computed(() => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l
    
    for (let i = 1; i <= totalPages.value; i++) {
      if (
        i === 1 ||
        i === totalPages.value ||
        (i >= currentPage.value - delta && i <= currentPage.value + delta)
      ) {
        range.push(i)
      }
    }
    
    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })
    
    return rangeWithDots
  })
  
  // Métodos
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      // Scroll suave al top
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const nextPage = () => goToPage(currentPage.value + 1)
  const prevPage = () => goToPage(currentPage.value - 1)
  const firstPage = () => goToPage(1)
  const lastPage = () => goToPage(totalPages.value)
  
  // Resetear página cuando cambian los items o items por página
  watch([items, itemsPerPage], () => {
    currentPage.value = 1
  })
  
  return {
    // Estado
    currentPage,
    itemsPerPage,
    
    // Computados
    totalItems,
    totalPages,
    paginatedItems,
    visiblePages,
    startIndex,
    endIndex,
    
    // Métodos
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage
  }
}