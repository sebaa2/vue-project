export const getEvolutionChain = async (pokemonId) => {
  try {
    // 1. Obtener especie y cadena evolutiva
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`)
    const speciesData = await speciesRes.json()

    const evolutionRes = await fetch(speciesData.evolution_chain.url)
    const evolutionData = await evolutionRes.json()

    // 2. Función mejorada para método de evolución
    const getMethod = async (details) => {
      if (!details || details.length === 0) return null

      const d = details[0]

      if (d.trigger?.name === 'level-up') {
        if (d.min_level) return `Nivel ${d.min_level}`
        if (d.min_happiness) return `Amistad`
        if (d.time_of_day) return `Nivel (${d.time_of_day})`
        return 'Nivel'
      }
      
      if (d.trigger?.name === 'use-item' && d.item) {
        // Obtener nombre del item en español
        try {
          const itemRes = await fetch(d.item.url)
          const itemData = await itemRes.json()
          
          // Buscar nombre en español
          const spanishName = itemData.names.find(
            name => name.language.name === 'es'
          )?.name || itemData.name
          
          return `Usar: ${spanishName}`
        } catch (error) {
          return 'Objeto'
        }
      }
      
      if (d.trigger?.name === 'trade') return 'Intercambio'
      return d.trigger?.name || '?'
    }

    // 3. Procesar cadena
    const result = []

    const process = async (chain, level = 0, method = null) => {
      if (!result[level]) result[level] = []

      result[level].push({
        name: chain.species.name,
        method: method,
        url: chain.species.url,
      })

      // Procesar evoluciones de forma recursiva
      for (const evo of chain.evolves_to) {
        const evoMethod = await getMethod(evo.evolution_details)
        await process(evo, level + 1, evoMethod)
      }
    }

    await process(evolutionData.chain)

    // 4. Obtener sprites
    for (let level = 0; level < result.length; level++) {
      for (let i = 0; i < result[level].length; i++) {
        const evo = result[level][i]
        const id = evo.url.split('/').slice(-2, -1)[0]
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
        const pokemonData = await pokemonRes.json()

        result[level][i] = {
          name: evo.name,
          id: parseInt(id),
          sprite: pokemonData.sprites.front_default,
          method: evo.method,
        }
      }
    }

    return result
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}