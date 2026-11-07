import { fetchCachedJson } from './cache.js'

const BASE_URL = 'https://data.pkmn.cc'

export const pkmnDataService = {
  getStats(formatId) {
    return fetchCachedJson('data.pkmn.cc', `${BASE_URL}/stats/${formatId}.json`)
  },

  getSets(formatId) {
    return fetchCachedJson('data.pkmn.cc', `${BASE_URL}/sets/${formatId}.json`)
  },
}
