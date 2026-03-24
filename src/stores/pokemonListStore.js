// stores/pokemonListStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePokemonListStore = defineStore('pokemonList', () => {
  const pokemons = ref([])
  const isLoading = ref(false)
  const totalPokemons = ref(0)
  const loadProgress = ref(0)
  const eggGroupsLoaded = ref(false)

  const allPokemons = computed(() => pokemons.value)

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

  // Mapeo de nombres de grupos huevo de la API a tus nombres
  const EGG_GROUP_MAPPING = {
    // Tu nombre -> Nombre en la API
    monster: 'monster',
    water1: 'water1',
    water2: 'water2',
    water3: 'water3',
    bug: 'bug',
    flying: 'flying',
    field: 'ground', // La API usa 'ground' para 'field'
    fairy: 'fairy',
    grass: 'plant', // La API usa 'plant' para 'grass'
    'human-like': 'humanshape', // La API usa 'humanshape' para 'human-like'
    mineral: 'mineral',
    amorphous: 'indeterminate', // La API usa 'indeterminate' para 'amorphous'
    ditto: 'ditto',
    dragon: 'dragon',
    'no-eggs': 'no-eggs',
  }

  // Mapeo inverso: de nombre de API a tu nombre
  const getEggGroupName = (apiGroupName) => {
    for (const [yourName, apiName] of Object.entries(EGG_GROUP_MAPPING)) {
      if (apiName === apiGroupName) {
        return yourName
      }
    }
    // Si no se encuentra, devolver el nombre original
    console.warn(`🥚 Grupo huevo no mapeado: ${apiGroupName}`)
    return apiGroupName
  }

  const filterSpecialForms = (pokemonList) => {
    return pokemonList.filter((pokemon) => {
      const name = pokemon.name.toLowerCase()
      if (name.startsWith('koraidon')) return name === 'koraidon'
      if (name.startsWith('miraidon')) return name === 'miraidon'
      const problematicZygarde = ['zygarde-10-power-construct', 'zygarde-50-power-construct']
      if (problematicZygarde.includes(name)) return false
      return true
    })
  }

  const formatMegaName = (name) => {
    if (name.includes('mega')) {
      const parts = name.split('-')
      const megaIndex = parts.findIndex((part) => part === 'mega')
      if (megaIndex !== -1) {
        const baseName = parts.slice(0, megaIndex).join(' ')
        const variant = parts.slice(megaIndex + 1).join(' ')
        const capitalizedBase = baseName.charAt(0).toUpperCase() + baseName.slice(1)
        let formatted = `Mega ${capitalizedBase}`
        if (variant) formatted += ` ${variant.toUpperCase()}`
        return formatted
      }
    }
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ')
  }

  const getGenerationByNumber = (id) => {
    for (const gen of generations) {
      if (id >= gen.range[0] && id <= gen.range[1]) return gen.id
    }
    return null
  }

  // Carga principal
  const loadPokemonList = async () => {
    if (pokemons.value.length > 0) return

    isLoading.value = true
    loadProgress.value = 0

    try {
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0')
      const data = await response.json()

      totalPokemons.value = data.results.length

      const batchSize = 20
      const allPokemonData = []

      for (let i = 0; i < data.results.length; i += batchSize) {
        const batch = data.results.slice(i, i + batchSize)
        const batchPromises = batch.map(async (pokemon) => {
          try {
            const detailResponse = await fetch(pokemon.url)
            const detail = await detailResponse.json()

            const generation = getGenerationByNumber(detail.id)

            return {
              id: detail.id,
              name: detail.name,
              formattedName: formatMegaName(detail.name),
              types: detail.types.map((t) => t.type.name),
              primaryType: detail.types[0]?.type.name || 'unknown',
              secondaryType: detail.types[1]?.type.name || null,
              sprites: detail.sprites,
              image:
                detail.sprites.other?.['official-artwork']?.front_default ||
                detail.sprites.front_default,
              generation,
              speciesName: detail.species?.name || detail.name,
              eggGroups: [],
            }
          } catch (error) {
            console.error(`Error cargando Pokémon ${pokemon.name}:`, error)
            return null
          }
        })

        const batchResults = await Promise.all(batchPromises)
        allPokemonData.push(...batchResults.filter((p) => p !== null))

        loadProgress.value = Math.round(((i + batch.length) / data.results.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      const sortedData = allPokemonData.sort((a, b) => a.id - b.id)
      pokemons.value = filterSpecialForms(sortedData)

      console.log('✅ Carga inicial completada. Total Pokémon:', pokemons.value.length)

      // Enriquecer con grupos huevo en segundo plano
      enrichWithEggGroups()
    } catch (error) {
      console.error('Error cargando lista de Pokémon:', error)
    } finally {
      isLoading.value = false
      loadProgress.value = 100
    }
  }

  // Enriquecimiento en segundo plano con mapeo de nombres
  const enrichWithEggGroups = async () => {
    try {
      console.log('🥚 ========== INICIANDO CARGA DE GRUPOS HUEVO ==========')
      console.log('🥚 Cargando grupos huevo en segundo plano...')

      const response = await fetch('https://pokeapi.co/api/v2/egg-group?limit=100')
      const data = await response.json()

      const map = new Map()

      // Cargar cada grupo específico
      for (const group of data.results) {
        try {
          const groupRes = await fetch(group.url)
          const groupData = await groupRes.json()

          // Convertir el nombre del grupo al formato que usas en tu app
          const mappedGroupName = getEggGroupName(group.name)
          console.log(
            `🥚 Grupo API "${group.name}" -> mapeado a "${mappedGroupName}" (ID: ${groupData.id})`,
          )

          // Guardar en el mapa con el nombre mapeado
          groupData.pokemon_species.forEach((s) => {
            const existing = map.get(s.name) || []
            existing.push(mappedGroupName)
            map.set(s.name, existing)
          })
        } catch (error) {
          console.error(`🥚 Error cargando grupo ${group.name}:`, error)
        }
      }

      // Verificar que el mapeo funciona correctamente
      const testCases = [
        { species: 'eevee', expectedGroups: ['field'] },
        { species: 'grimer', expectedGroups: ['amorphous'] },
        { species: 'mr-mime', expectedGroups: ['human-like'] },
        { species: 'tangela', expectedGroups: ['grass'] },
        { species: 'tauros', expectedGroups: ['field'] },
        { species: 'gastly', expectedGroups: ['amorphous'] },
        { species: 'machop', expectedGroups: ['human-like'] },
        { species: 'oddish', expectedGroups: ['grass'] },
        { species: 'ponyta', expectedGroups: ['field'] },
        { species: 'bulbasaur', expectedGroups: ['monster', 'grass'] },
        { species: 'pikachu', expectedGroups: ['field', 'fairy'] },
        { species: 'charmander', expectedGroups: ['monster', 'dragon'] },
        { species: 'squirtle', expectedGroups: ['monster', 'water1'] },
      ]

      console.log('🥚 ========== VERIFICANDO MAPEO ==========')
      testCases.forEach(({ species, expectedGroups }) => {
        const found = map.get(species) || []
        const match =
          expectedGroups.every((g) => found.includes(g)) && expectedGroups.length === found.length
        console.log(
          `  ${species.padEnd(15)} esperado [${expectedGroups.join(', ').padEnd(20)}] -> encontrado [${found.join(', ').padEnd(20)}] ${match ? '✅' : '❌'}`,
        )
      })

      // Actualizar los Pokémon
      let updatedCount = 0
      let emptyCount = 0
      const updatedPokemons = pokemons.value.map((pokemon) => {
        const eggGroups = map.get(pokemon.speciesName) || []

        if (eggGroups.length === 0) {
          emptyCount++
        } else {
          updatedCount++
        }

        return {
          ...pokemon,
          eggGroups,
        }
      })

      pokemons.value = updatedPokemons

      // Verificar resultados finales
      console.log('🥚 ========== RESULTADOS FINALES ==========')
      console.log(`   Pokémon con grupos: ${updatedCount}`)
      console.log(`   Pokémon sin grupos: ${emptyCount}`)

      const verifyPokemon = [
        'eevee',
        'grimer',
        'mr-mime',
        'tangela',
        'tauros',
        'gastly',
        'machop',
        'oddish',
        'ponyta',
        'bulbasaur',
        'pikachu',
      ]
      verifyPokemon.forEach((name) => {
        const pokemon = pokemons.value.find((p) => p.name === name)
        if (pokemon) {
          console.log(`  ✅ ${name.padEnd(15)} -> eggGroups=[${pokemon.eggGroups.join(', ')}]`)
        }
      })

      console.log('🥚 ========== FIN CARGA DE GRUPOS HUEVO ==========')
      eggGroupsLoaded.value = true
    } catch (error) {
      console.error('🥚 Error cargando grupos huevo:', error)
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
    eggGroupsLoaded,
    allPokemons,
    generations,
    loadPokemonList,
    getGenerationByNumber,
    getPokemonByGeneration,
  }
})
