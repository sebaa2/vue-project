// stores/pokemonListStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePokemonListStore = defineStore('pokemonList', () => {
  const pokemons = ref([])
  const isLoading = ref(false)
  const totalPokemons = ref(0)
  const loadProgress = ref(0)

  const allPokemons = computed(() => pokemons.value)

  // Definición de generaciones con rangos CORRECTOS
  const generations = [
    { id: 1, name: 'Generación I', range: [1, 151], description: 'Kanto (1-151)' },
    { id: 2, name: 'Generación II', range: [152, 251], description: 'Johto (152-251)' },
    { id: 3, name: 'Generación III', range: [252, 386], description: 'Hoenn (252-386)' },
    { id: 4, name: 'Generación IV', range: [387, 493], description: 'Sinnoh (387-493)' },
    { id: 5, name: 'Generación V', range: [494, 649], description: 'Teselia (494-649)' },
    { id: 6, name: 'Generación VI', range: [650, 721], description: 'Kalos (650-721)' },
    { id: 7, name: 'Generación VII', range: [722, 809], description: 'Alola (722-809)' },
    { id: 8, name: 'Generación VIII', range: [810, 898], description: 'Galar (810-898)' },
    { id: 9, name: 'Generación IX', range: [899, 1025], description: 'Paldea (899-1025)' },
  ]

  // Función para obtener generación por ID
  const getGenerationByNumber = (id) => {
    for (const gen of generations) {
      if (id >= gen.range[0] && id <= gen.range[1]) {
        return gen.id
      }
    }
    // Fallback para IDs fuera de rango
    if (id >= 1 && id <= 151) return 1
    if (id >= 152 && id <= 251) return 2
    if (id >= 252 && id <= 386) return 3
    if (id >= 387 && id <= 493) return 4
    if (id >= 494 && id <= 649) return 5
    if (id >= 650 && id <= 721) return 6
    if (id >= 722 && id <= 809) return 7
    if (id >= 810 && id <= 898) return 8
    if (id >= 899 && id <= 1025) return 9
    return null
  }

  const loadPokemonList = async () => {
    if (pokemons.value.length > 0) return

    isLoading.value = true
    loadProgress.value = 0

    try {
      // Cargar los 1025 Pokémon
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0')
      const data = await response.json()

      totalPokemons.value = data.results.length

      // Cargar detalles en lotes
      const batchSize = 20
      const allPokemonData = []

      for (let i = 0; i < data.results.length; i += batchSize) {
        const batch = data.results.slice(i, i + batchSize)
        const batchPromises = batch.map(async (pokemon) => {
          try {
            const detailResponse = await fetch(pokemon.url)
            const detail = await detailResponse.json()

            // Calcular generación basada en el ID
            const generation = getGenerationByNumber(detail.id)

            return {
              id: detail.id,
              name: detail.name,
              types: detail.types.map((t) => t.type.name),
              primaryType: detail.types[0]?.type.name || 'unknown',
              secondaryType: detail.types[1]?.type.name || null,
              sprites: detail.sprites,
              image:
                detail.sprites.other?.['official-artwork']?.front_default ||
                detail.sprites.front_default,
              generation: generation,
            }
          } catch (error) {
            console.error(`Error cargando Pokémon ${pokemon.name}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        const validResults = batchResults.filter((p) => p !== null)
        allPokemonData.push(...validResults)

        loadProgress.value = Math.round(((i + batch.length) / data.results.length) * 100)

        // Pequeña pausa para no sobrecargar la API
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      pokemons.value = allPokemonData.sort((a, b) => a.id - b.id)

      // Verificar datos (puedes quitar esto después)
      console.log('Total Pokémon cargados:', pokemons.value.length)
      console.log(
        'Generación de Bulbasaur (ID 1):',
        pokemons.value.find((p) => p.id === 1)?.generation,
      )
      console.log(
        'Generación de Pikachu (ID 25):',
        pokemons.value.find((p) => p.id === 25)?.generation,
      )
      console.log(
        'Generación de Chikorita (ID 152):',
        pokemons.value.find((p) => p.id === 152)?.generation,
      )
    } catch (error) {
      console.error('Error cargando lista de Pokémon:', error)
    } finally {
      isLoading.value = false
      loadProgress.value = 100
    }
  }

  const getPokemonByGeneration = (generationId) => {
    if (!generationId) return pokemons.value
    const gen = generations.find((g) => g.id === generationId)
    if (!gen) return pokemons.value
    return pokemons.value.filter((p) => p.id >= gen.range[0] && p.id <= gen.range[1])
  }

  return {
    pokemons,
    isLoading,
    totalPokemons,
    loadProgress,
    allPokemons,
    generations,
    loadPokemonList,
    getGenerationByNumber,
    getPokemonByGeneration,
  }
})
