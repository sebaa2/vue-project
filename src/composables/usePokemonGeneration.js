// composables/usePokemonGeneration.js
import { computed, ref } from 'vue'

export function usePokemonGeneration() {
  
  // Configuración de generaciones
  const generations = ref([
    { id: 1, name: 'Generación I', range: [1, 151], color: 'bg-red-500' },
    { id: 2, name: 'Generación II', range: [152, 251], color: 'bg-orange-500' },
    { id: 3, name: 'Generación III', range: [252, 386], color: 'bg-yellow-500' },
    { id: 4, name: 'Generación IV', range: [387, 493], color: 'bg-green-500' },
    { id: 5, name: 'Generación V', range: [494, 649], color: 'bg-blue-500' },
    { id: 6, name: 'Generación VI', range: [650, 721], color: 'bg-indigo-500' },
    { id: 7, name: 'Generación VII', range: [722, 809], color: 'bg-purple-500' },
    { id: 8, name: 'Generación VIII', range: [810, 898], color: 'bg-pink-500' },
    { id: 9, name: 'Generación IX', range: [899, 1025], color: 'bg-gray-700' }
  ])
  
  // Obtener generación por ID
  const getPokemonGeneration = (id) => {
    if (!id) return null
    
    const gen = generations.value.find(g => 
      id >= g.range[0] && id <= g.range[1]
    )
    
    return gen?.id || null
  }
  
  // Obtener nombre de generación
  const getGenerationName = (genId) => {
    if (!genId) return ''
    const gen = generations.value.find(g => g.id === parseInt(genId))
    return gen?.name || `Gen ${genId}`
  }
  
  // Obtener color de generación
  const getGenerationColor = (genId) => {
    if (!genId) return ''
    const gen = generations.value.find(g => g.id === parseInt(genId))
    return gen?.color || 'bg-gray-500'
  }
  
  // Filtrar Pokémon por generación
  const filterByGeneration = (pokemons, genId) => {
    if (!genId || genId === 'all') return pokemons
    
    const gen = generations.value.find(g => g.id === parseInt(genId))
    if (!gen) return pokemons
    
    return pokemons.filter(pokemon => 
      pokemon.id >= gen.range[0] && pokemon.id <= gen.range[1]
    )
  }
  
  // Opciones para select de generaciones
  const generationOptions = computed(() => {
    return generations.value.map(gen => ({
      id: gen.id,
      name: gen.name,
      range: gen.range
    }))
  })
  
  return {
    generations,
    generationOptions,
    getPokemonGeneration,
    getGenerationName,
    getGenerationColor,
    filterByGeneration
  }
}