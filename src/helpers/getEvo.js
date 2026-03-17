export const getEvolutionChain = async (pokemonId) => {
  try {
    // 1. Obtener la especie del Pokémon
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`)
    const speciesData = await speciesRes.json()

    // 2. Obtener la URL de la cadena evolutiva
    const evolutionUrl = speciesData.evolution_chain.url

    // 3. Obtener los datos de la cadena evolutiva
    const evolutionRes = await fetch(evolutionUrl)
    const evolutionData = await evolutionRes.json()

    // 4. Procesar la cadena para agrupar por niveles
    const evolutionByLevel = []

    // Función recursiva para recorrer la cadena y agrupar por nivel
    function extractEvolutionsByLevel(chain, level = 0) {
      // Si no existe el nivel, crearlo
      if (!evolutionByLevel[level]) {
        evolutionByLevel[level] = []
      }

      // Agregar el Pokémon actual al nivel correspondiente
      evolutionByLevel[level].push({
        name: chain.species.name,
        url: chain.species.url,
      })

      // Procesar las siguientes evoluciones
      if (chain.evolves_to && chain.evolves_to.length > 0) {
        chain.evolves_to.forEach((evolution) => {
          extractEvolutionsByLevel(evolution, level + 1)
        })
      }
    }

    extractEvolutionsByLevel(evolutionData.chain)

    // 5. Obtener datos básicos de cada Pokémon en la cadena (para sprites)
    const evolutionDetails = await Promise.all(
      evolutionByLevel.map(async (level, levelIndex) => {
        // Si el nivel tiene múltiples Pokémon (eevee)
        if (level.length > 1) {
          const levelDetails = await Promise.all(
            level.map(async (evo) => {
              const id = evo.url.split('/').filter(Boolean).pop()
              const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
              const pokemonData = await pokemonRes.json()

              return {
                name: evo.name,
                id: id,
                sprite: pokemonData.sprites.front_default,
                types: pokemonData.types.map((t) => t.type.name),
              }
            }),
          )
          return levelDetails
        }
        // Si es un solo Pokémon en el nivel
        else {
          const evo = level[0]
          const id = evo.url.split('/').filter(Boolean).pop()
          const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
          const pokemonData = await pokemonRes.json()

          return {
            name: evo.name,
            id: id,
            sprite: pokemonData.sprites.front_default,
            types: pokemonData.types.map((t) => t.type.name),
          }
        }
      }),
    )

    console.log('Evoluciones por nivel:', evolutionDetails)
    return evolutionDetails
  } catch (error) {
    console.error('Error obteniendo cadena evolutiva:', error)
    return []
  }
}
