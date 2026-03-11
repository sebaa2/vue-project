export const getPokemon = async (id) => {
  const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
  const pokemonData = await resPokemon.json()
  return pokemonData
}
