// helpers/getSearchPoke.js (versión optimizada)
import { usePokemonCacheStore } from '../stores/pokemonCacheStore.js'

export const getSearchPoke = async () => {
  const cacheStore = usePokemonCacheStore()
  const CACHE_KEY = 'pokemon-list-full'

  // 1. Verificar si ya está en caché
  const cached = cacheStore.getPokemon(CACHE_KEY)
  if (cached) {
    console.log('📀 Lista de Pokémon cargada desde caché (instantáneo)')
    return cached
  }

  console.log('🌐 Cargando lista de Pokémon desde API...')

  // 2. Cargar en lotes para no bloquear
  const LIMIT = 100 // Cargar de 100 en 100
  const TOTAL = 1025
  const allPokemons = []

  for (let offset = 0; offset < TOTAL; offset += LIMIT) {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`,
    )
    const data = await response.json()

    // Procesar este lote
    data.results.forEach((element, idx) => {
      const pokemon = {
        ...element,
        index: offset + idx + 1,
        name: element.name,
        url: element.url,
      }
      allPokemons.push(pokemon)
    })

    console.log(`📦 Cargado lote ${offset / LIMIT + 1}: ${allPokemons.length}/${TOTAL} Pokémon`)

    // Pequeña pausa para no saturar
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  // Guardar en caché
  cacheStore.setPokemon(CACHE_KEY, allPokemons)
  console.log(`✅ ${allPokemons.length} Pokémon guardados en caché`)

  return allPokemons
}
