import { fetchCachedJson } from './cache.js'

const BASE_URL = 'https://poke.itlibra.com/opendata'
const SUPPORTED_FORMATS = new Set(['vgc', 'ou', 'doublesou'])

export const pokeKitService = {
  getUsage(formatId) {
    if (!SUPPORTED_FORMATS.has(formatId)) {
      throw new Error(`PokéKit no publica un formato de uso compatible: ${formatId}`)
    }

    return fetchCachedJson(
      'PokéKit',
      `${BASE_URL}/usage-${formatId}.json`,
      60 * 60 * 1000,
    )
  },
}
