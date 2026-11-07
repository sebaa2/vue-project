import { fetchCachedJson } from './cache.js'
import { normalizeShowdownMove, toPokemonId } from './normalizers.js'

const MOVES_URL = 'https://play.pokemonshowdown.com/data/moves.json'

export const pokemonShowdownService = {
  async getMoveNames() {
    const moves = await fetchCachedJson('Pokémon Showdown', MOVES_URL, 60 * 60 * 1000)
    return Object.fromEntries(
      Object.entries(moves).map(([id, move]) => [toPokemonId(id), move.name]),
    )
  },

  async getMove(name) {
    const moves = await fetchCachedJson('Pokémon Showdown', MOVES_URL, 60 * 60 * 1000)
    const move = moves[toPokemonId(name)]
    if (!move) {
      throw new Error(`Pokémon Showdown no tiene datos técnicos para el movimiento «${name}».`)
    }
    return normalizeShowdownMove(move)
  },
}
