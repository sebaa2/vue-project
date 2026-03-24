// composables/usePokemonFilters.js
import { ref, computed, watch } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { getTiposOptions } from '../config/arrayTipo.js'
import { usePokemonGeneration } from './usePokemonGeneration.js'
import { usePokemonUtils } from './usePokemonUtils.js'

export function usePokemonFilters(allPokemons) {
  
  // Dependencias
  const { filterByGeneration } = usePokemonGeneration()
  const { isMegaPokemon } = usePokemonUtils()
  
  // Tipos disponibles
  const tipoOptions = getTiposOptions()
  const pokemonTypes = tipoOptions.map(opt => opt.value)
  
  // Estado con persistencia en localStorage
  const searchQuery = useLocalStorage('pokedex-search', '')
  const selectedPrimaryType = useLocalStorage('pokedex-primary-type', 'all')
  const selectedSecondaryType = useLocalStorage('pokedex-secondary-type', 'all')
  const selectedGeneration = useLocalStorage('pokedex-generation', 'all')
  const showOnlyMegas = useLocalStorage('pokedex-show-megas', false)
  
  // Estados para UI
  const isFiltering = ref(false)
  const filterExecutionTime = ref(0)
  
  // Funciones de filtrado individuales (puras y testables)
  const applySearchFilter = (list, query) => {
    if (!query) return list
    
    const lowerQuery = query.toLowerCase()
    return list.filter(pokemon => 
      pokemon.name?.toLowerCase().includes(lowerQuery) ||
      pokemon.id?.toString().includes(lowerQuery) ||
      pokemon.formattedName?.toLowerCase().includes(lowerQuery)
    )
  }
  
  const applyPrimaryTypeFilter = (list, type) => {
    if (type === 'all') return list
    return list.filter(pokemon => pokemon.primaryType === type)
  }
  
  const applySecondaryTypeFilter = (list, type) => {
    if (type === 'all') return list
    
    if (type === 'none') {
      return list.filter(pokemon => !pokemon.secondaryType)
    }
    
    return list.filter(pokemon => pokemon.secondaryType === type)
  }
  
  const applyMegaFilter = (list, onlyMegas) => {
    if (!onlyMegas) return list
    return list.filter(pokemon => isMegaPokemon(pokemon.name))
  }
  
  // Computed principal con todos los filtros
  const filteredPokemons = computed(() => {
    if (!allPokemons.value) return []
    
    const startTime = performance.now()
    isFiltering.value = true
    
    let filtered = [...allPokemons.value]
    
    // Aplicar filtros en orden
    filtered = applySearchFilter(filtered, searchQuery.value)
    filtered = applyPrimaryTypeFilter(filtered, selectedPrimaryType.value)
    filtered = applySecondaryTypeFilter(filtered, selectedSecondaryType.value)
    filtered = filterByGeneration(filtered, selectedGeneration.value)
    filtered = applyMegaFilter(filtered, showOnlyMegas.value)
    
    const endTime = performance.now()
    filterExecutionTime.value = endTime - startTime
    
    // Pequeño delay para evitar parpadeos en UI
    setTimeout(() => {
      isFiltering.value = false
    }, 100)
    
    return filtered
  })
  
  // Verificar si hay filtros activos
  const hasActiveFilters = computed(() => {
    return searchQuery.value !== '' ||
           selectedPrimaryType.value !== 'all' ||
           selectedSecondaryType.value !== 'all' ||
           selectedGeneration.value !== 'all' ||
           showOnlyMegas.value
  })
  
  // Contar filtros activos
  const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value) count++
    if (selectedPrimaryType.value !== 'all') count++
    if (selectedSecondaryType.value !== 'all') count++
    if (selectedGeneration.value !== 'all') count++
    if (showOnlyMegas.value) count++
    return count
  })
  
  // Resetear todos los filtros
  const resetFilters = () => {
    searchQuery.value = ''
    selectedPrimaryType.value = 'all'
    selectedSecondaryType.value = 'all'
    selectedGeneration.value = 'all'
    showOnlyMegas.value = false
  }
  
  // Eliminar un filtro específico
  const removeFilter = (filterName) => {
    switch (filterName) {
      case 'search':
        searchQuery.value = ''
        break
      case 'primaryType':
        selectedPrimaryType.value = 'all'
        break
      case 'secondaryType':
        selectedSecondaryType.value = 'all'
        break
      case 'generation':
        selectedGeneration.value = 'all'
        break
      case 'megas':
        showOnlyMegas.value = false
        break
    }
  }
  
  return {
    // Estado
    searchQuery,
    selectedPrimaryType,
    selectedSecondaryType,
    selectedGeneration,
    showOnlyMegas,
    pokemonTypes,
    
    // Computados
    filteredPokemons,
    hasActiveFilters,
    activeFiltersCount,
    isFiltering,
    filterExecutionTime,
    
    // Métodos
    resetFilters,
    removeFilter
  }
}