// composables/usePokemonPagination.js
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core' // ✅ Importar desde @vueuse/core

export function usePokemonPagination(itemsComputed, defaultItemsPerPage = 24) {
  
  // Estado con persistencia automática
  const currentPage = ref(1)
  const itemsPerPage = useLocalStorage('pokedex-items-per-page', defaultItemsPerPage)
  
  // Computados
  const totalItems = computed(() => itemsComputed.value?.length || 0)
  const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value))
  
  const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
  const endIndex = computed(() => startIndex.value + itemsPerPage.value)
  
  const paginatedItems = computed(() => {
    const items = itemsComputed.value
    if (!items || items.length === 0) return []
    return items.slice(startIndex.value, endIndex.value)
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
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  // Resetear página cuando cambian los items
  watch(itemsComputed, () => {
    currentPage.value = 1
  })
  
  return {
    currentPage,
    itemsPerPage,
    totalItems,
    totalPages,
    paginatedItems,
    visiblePages,
    goToPage
  }
}