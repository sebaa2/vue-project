// composables/usePokemonFilters.js
import { ref, computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { getTiposOptions } from '../config/arrayTipo.js'
import { usePokemonGeneration } from './usePokemonGeneration.js'
import { usePokemonUtils } from './usePokemonUtils.js'

// 🥚 IDs y slugs exactos de la PokeAPI (GET /api/v2/egg-group)
export const EGG_GROUP_LABELS = {
  monster: 'Monster', // 1
  water1: 'Water 1', // 2
  bug: 'Bug', // 3
  flying: 'Flying', // 4
  field: 'Field', // 5
  fairy: 'Fairy', // 6
  grass: 'Grass', // 7
  'human-like': 'Human-Like', // 8
  water3: 'Water 3', // 9
  mineral: 'Mineral', // 10
  amorphous: 'Amorphous', // 11
  water2: 'Water 2', // 12
  ditto: 'Ditto', // 13
  dragon: 'Dragon', // 14
  'no-eggs': 'Sin Grupo', // 15
}

// Lista completa ordenada alfabéticamente — siempre se muestran todas las opciones
export const EGG_GROUP_OPTIONS = Object.entries(EGG_GROUP_LABELS)
  .map(([value, label]) => ({ value, label }))
  .sort((a, b) => a.label.localeCompare(b.label))

export function usePokemonFilters(allPokemonsComputed) {
  const { filterByGeneration } = usePokemonGeneration()
  const { isMegaPokemon } = usePokemonUtils()

  // Tipos disponibles
  const tipoOptions = getTiposOptions()
  const sortedTipoOptions = [...tipoOptions].sort((a, b) => a.label.localeCompare(b.label))
  const pokemonTypes = sortedTipoOptions.map((opt) => opt.value)

  // Estado con persistencia automática
  const searchQuery = useLocalStorage('pokedex-search', '')
  const selectedPrimaryType = useLocalStorage('pokedex-primary-type', 'all')
  const selectedSecondaryType = useLocalStorage('pokedex-secondary-type', 'all')
  const selectedGeneration = useLocalStorage('pokedex-generation', 'all')
  const showOnlyMegas = useLocalStorage('pokedex-show-megas', false)
  const selectedEggGroup = useLocalStorage('pokedex-egg-group', 'all') // 🥚

  // Estados para UI
  const isFiltering = ref(false)
  const filterExecutionTime = ref(0)

  // ── Funciones de filtrado individuales ──────────────────────────────────────

  const applySearchFilter = (list, query) => {
    if (!query) return list
    const lowerQuery = query.toLowerCase()
    return list.filter(
      (pokemon) =>
        pokemon.name?.toLowerCase().includes(lowerQuery) ||
        pokemon.id?.toString().includes(lowerQuery) ||
        pokemon.formattedName?.toLowerCase().includes(lowerQuery),
    )
  }

  const applyPrimaryTypeFilter = (list, type) => {
    if (type === 'all') return list
    return list.filter((pokemon) => pokemon.primaryType === type)
  }

  const applySecondaryTypeFilter = (list, type) => {
    if (type === 'all') return list
    if (type === 'none') return list.filter((pokemon) => !pokemon.secondaryType)
    return list.filter((pokemon) => pokemon.secondaryType === type)
  }

  const applyMegaFilter = (list, onlyMegas) => {
    if (!onlyMegas) return list
    return list.filter((pokemon) => isMegaPokemon(pokemon.name))
  }

  const applyEggGroupFilter = (list, eggGroup) => {
    if (eggGroup === 'all') return list
    return list.filter(
      (pokemon) => Array.isArray(pokemon.eggGroups) && pokemon.eggGroups.includes(eggGroup),
    )
  }

  // ── Computed principal ──────────────────────────────────────────────────────

  const filteredPokemons = computed(() => {
    const allPokemons = allPokemonsComputed.value
    if (!allPokemons || allPokemons.length === 0) return []

    const startTime = performance.now()
    isFiltering.value = true

    let filtered = [...allPokemons]
    filtered = applySearchFilter(filtered, searchQuery.value)
    filtered = applyPrimaryTypeFilter(filtered, selectedPrimaryType.value)
    filtered = applySecondaryTypeFilter(filtered, selectedSecondaryType.value)
    filtered = filterByGeneration(filtered, selectedGeneration.value)
    filtered = applyMegaFilter(filtered, showOnlyMegas.value)
    filtered = applyEggGroupFilter(filtered, selectedEggGroup.value)

    filterExecutionTime.value = performance.now() - startTime
    setTimeout(() => {
      isFiltering.value = false
    }, 100)

    return filtered
  })

  const hasActiveFilters = computed(() => {
    return (
      searchQuery.value !== '' ||
      selectedPrimaryType.value !== 'all' ||
      selectedSecondaryType.value !== 'all' ||
      selectedGeneration.value !== 'all' ||
      showOnlyMegas.value ||
      selectedEggGroup.value !== 'all'
    )
  })

  const activeFiltersCount = computed(() => {
    let count = 0
    if (searchQuery.value) count++
    if (selectedPrimaryType.value !== 'all') count++
    if (selectedSecondaryType.value !== 'all') count++
    if (selectedGeneration.value !== 'all') count++
    if (showOnlyMegas.value) count++
    if (selectedEggGroup.value !== 'all') count++
    return count
  })

  const resetFilters = () => {
    searchQuery.value = ''
    selectedPrimaryType.value = 'all'
    selectedSecondaryType.value = 'all'
    selectedGeneration.value = 'all'
    showOnlyMegas.value = false
    selectedEggGroup.value = 'all'
  }

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
      case 'eggGroup':
        selectedEggGroup.value = 'all'
        break
    }
  }

  return {
    searchQuery,
    selectedPrimaryType,
    selectedSecondaryType,
    selectedGeneration,
    showOnlyMegas,
    selectedEggGroup,
    pokemonTypes,
    filteredPokemons,
    hasActiveFilters,
    activeFiltersCount,
    isFiltering,
    filterExecutionTime,
    resetFilters,
    removeFilter,
  }
}
