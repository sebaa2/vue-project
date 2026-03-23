// helpers/getSearchPoke.js (versión optimizada con filtro)
import { usePokemonCacheStore } from '../stores/pokemonCacheStore.js'

export const getSearchPoke = async () => {
  const cacheStore = usePokemonCacheStore()
  const CACHE_KEY = 'pokemon-list-full'
  const MAX_POKEMON_ID = 1025 // peracharount

  // 1. Verificar si ya está en caché
  const cached = cacheStore.getPokemon(CACHE_KEY)
  if (cached) {
    console.log('📀 Lista de Pokémon cargada desde caché (instantáneo)')
    // Filtrar por si acaso hay datos antiguos con megas
    const filteredCache = cached.filter((pokemon) => pokemon.index <= MAX_POKEMON_ID)
    return filteredCache
  }

  console.log('🌐 Cargando lista de Pokémon desde API...')

  // 2. Cargar en lotes
  const LIMIT = 100
  const TOTAL = 1025
  const allPokemons = []

  for (let offset = 0; offset < TOTAL; offset += LIMIT) {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`,
    )
    const data = await response.json()

    // Procesar este lote y filtrar por ID
    data.results.forEach((element, idx) => {
      const pokemonId = offset + idx + 1

      // ✅ SOLO agregar si el ID es menor o igual a 1025
      if (pokemonId <= MAX_POKEMON_ID) {
        const pokemon = {
          ...element,
          index: pokemonId,
          name: element.name,
          url: element.url,
        }
        allPokemons.push(pokemon)
      }
    })

    console.log(`📦 Cargado lote ${offset / LIMIT + 1}: ${allPokemons.length}/${TOTAL} Pokémon`)
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  // Guardar en caché
  cacheStore.setPokemon(CACHE_KEY, allPokemons)
  console.log(
    `✅ ${allPokemons.length} Pokémon guardados en caché (solo hasta ID ${MAX_POKEMON_ID})`,
  )

  return allPokemons
}
