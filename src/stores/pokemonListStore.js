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

  // 🆕 FUNCIÓN DE FILTRO MEJORADA - Excluye TODAS las formas alternativas
  const filterSpecialForms = (pokemonList) => {
    return pokemonList.filter((pokemon) => {
      const name = pokemon.name.toLowerCase()

      // Para Koraidon: SOLO mantener la forma exacta 'koraidon'
      if (name.startsWith('koraidon')) {
        // Solo mantener si es EXACTAMENTE 'koraidon'
        return name === 'koraidon'
      }

      // Para Miraidon: SOLO mantener la forma exacta 'miraidon'
      if (name.startsWith('miraidon')) {
        // Solo mantener si es EXACTAMENTE 'miraidon'
        return name === 'miraidon'
      }

      // Para Zygarde: excluir formas específicas
      const problematicZygarde = ['zygarde-10-power-construct', 'zygarde-50-power-construct']
      if (problematicZygarde.includes(name)) {
        return false
      }

      // Para el resto de Pokémon, mantenerlos todos
      return true
    })
  }

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

      // Ordenar por ID
      const sortedData = allPokemonData.sort((a, b) => a.id - b.id)

      // 🔍 Log para ver todas las formas ANTES del filtro
      const allKoraidonForms = sortedData.filter((p) => p.name.includes('koraidon'))
      const allMiraidonForms = sortedData.filter((p) => p.name.includes('miraidon'))
      console.log(
        '📊 TODAS las formas de Koraidon ANTES del filtro:',
        allKoraidonForms.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      )
      console.log(
        '📊 TODAS las formas de Miraidon ANTES del filtro:',
        allMiraidonForms.map((p) => ({
          id: p.id,
          name: p.name,
        })),
      )

      // Aplicar filtro
      const filteredData = filterSpecialForms(sortedData)

      pokemons.value = filteredData

      // 🔍 Log para ver las formas DESPUÉS del filtro
      const koraidonAfter = pokemons.value.filter((p) => p.name.includes('koraidon'))
      const miraidonAfter = pokemons.value.filter((p) => p.name.includes('miraidon'))
      console.log(
        '✅ Formas de Koraidon DESPUÉS del filtro:',
        koraidonAfter.map((p) => p.name),
      )
      console.log(
        '✅ Formas de Miraidon DESPUÉS del filtro:',
        miraidonAfter.map((p) => p.name),
      )
      console.log('🗑️ Total formas excluidas:', allPokemonData.length - pokemons.value.length)
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
