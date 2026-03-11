
export const getSpecies = async (id) => {
  const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  return await resSpecies.json().varieties
} 
