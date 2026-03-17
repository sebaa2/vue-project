export const getSpecies = async (id) => {
  const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  const speciesData = await resSpecies.json()

  let varieties = [...speciesData.varieties]

  if (Number(id) === 421) {
    varieties.push({
      is_default: false,
      pokemon: {
        name: "cherrim-sunshine",
        url: "https://pokeapi.co/api/v2/pokemon/421"
      }
    })
  }

  return varieties
}