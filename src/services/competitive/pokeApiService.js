import { fetchCachedJson } from './cache.js'
import { getSpanishName } from '../../helpers/getNombresES.js'
import { toPokemonId } from './normalizers.js'

const BASE_URL = 'https://pokeapi.co/api/v2'
const RESOURCE_URLS = {
  move: `${BASE_URL}/move?limit=2000`,
  item: `${BASE_URL}/item?limit=2000`,
  ability: `${BASE_URL}/ability?limit=2000`,
}

export const pokeApiService = {
  getPokemon(name) {
    const pokemonId = encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, '-'))
    return fetchCachedJson('PokéAPI', `${BASE_URL}/pokemon/${pokemonId}`)
  },

  async getLocalizedName(resource, id) {
    const indexUrl = RESOURCE_URLS[resource]
    if (!indexUrl) throw new Error(`Tipo de recurso de PokéAPI no compatible: ${resource}`)

    const index = await fetchCachedJson('PokéAPI', indexUrl, 60 * 60 * 1000)
    const entry = index.results.find((result) => toPokemonId(result.name) === toPokemonId(id))
    if (!entry) return { name: id, translated: false }

    const details = await fetchCachedJson('PokéAPI', entry.url, 60 * 60 * 1000)
    const spanishName = getSpanishName(details.names)

    return {
      name: spanishName || entry.name,
      translated: Boolean(spanishName),
    }
  },
}
