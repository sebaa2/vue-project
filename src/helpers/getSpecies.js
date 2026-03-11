export const getSpecies = async (id) => {
  const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  const speciesData = await resSpecies.json()
  return speciesData.varieties
}
