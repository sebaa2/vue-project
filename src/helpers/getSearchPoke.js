export const getSearchPoke = async () => {
  const resList = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`)
  const pokemonSearch = await resList.json()
  const array_pokemon = []
  pokemonSearch.results.forEach((element, index) => {
    const pokemon = {
      ...element,
      index: index + 1,
    }
    array_pokemon.push(pokemon)
  })

  return array_pokemon //donde dejo la const del index
}
