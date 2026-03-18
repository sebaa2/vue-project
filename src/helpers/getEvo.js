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
        try {
          const itemRes = await fetch(d.item.url)
          const itemData = await itemRes.json()
          const spanishName =
            itemData.names.find((name) => name.language.name === 'es')?.name || itemData.name
          return `Usar: ${spanishName}`
        } catch (error) {
          return 'Objeto'
        }
      }

      if (d.trigger?.name === 'trade') return 'Intercambio'
      return d.trigger?.name || '?'
    }

    // 3. Función para obtener la región de una forma
    const getRegionFromForm = (formName) => {
      if (formName.includes('-alola')) return 'Alola'
      if (formName.includes('-galar')) return 'Galar'
      if (formName.includes('-hisui')) return 'Hisui'
      if (formName.includes('-paldea')) return 'Paldea'
      return 'Regional'
    }

    // 4. Mapa de formas regionales especiales
    const regionalFormsMap = {
      'cubone': {
        forms: ['marowak-alola'],
        baseEvo: 'marowak'
      },
      'exeggcute': {
        forms: ['exeggutor-alola'],
        baseEvo: 'exeggutor'
      },
      'koffing': {
        forms: ['weezing-galar'],
        baseEvo: 'weezing'
      },
      'mime-jr': {
        forms: ['mr-mime-galar'],
        baseEvo: 'mr-mime'
      },
      'pikachu': {
        forms: ['raichu-alola'],
        baseEvo: 'raichu'
      }
    }

    // 5. Procesar cadena
    const result = []

    const process = async (chain, level = 0, method = null) => {
      if (!result[level]) result[level] = []

      const pokemonName = chain.species.name
      
      // Agregar Pokémon base
      const basePokemon = {
        name: pokemonName,
        method: method,
        url: chain.species.url,
      }
      
      // Verificar si ya existe para evitar duplicados
      const exists = result[level].some(e => e.name === pokemonName)
      if (!exists) {
        result[level].push(basePokemon)
      }

      // Procesar evoluciones
      for (const evo of chain.evolves_to) {
        const evoMethod = await getMethod(evo.evolution_details)
        const evoName = evo.species.name
        
        // Agregar la evolución base
        const baseEvoExists = result[level + 1]?.some(e => e.name === evoName)
        if (!baseEvoExists) {
          if (!result[level + 1]) result[level + 1] = []
          result[level + 1].push({
            name: evoName,
            method: evoMethod,
            url: evo.species.url,
          })
        }
        
        // Verificar si el Pokémon actual tiene formas regionales para esta evolución
        if (regionalFormsMap[pokemonName] && 
            regionalFormsMap[pokemonName].baseEvo === evoName) {
          
          for (const form of regionalFormsMap[pokemonName].forms) {
            const formExists = result[level + 1]?.some(e => e.name === form)
            if (!formExists) {
              const region = getRegionFromForm(form)
              if (!result[level + 1]) result[level + 1] = []
              result[level + 1].push({
                name: form,
                displayName: `${evoName} (${region})`,
                method: evoMethod === 'Nivel' ? `Nivel (${region})` : evoMethod,
                url: evo.species.url,
                isRegional: true,
                region: region
              })
            }
          }
        }
        
        // Procesar siguientes evoluciones recursivamente
        await process(evo, level + 1, evoMethod)
      }
    }

    await process(evolutionData.chain)

    // 6. Obtener sprites y tipos
    for (let level = 0; level < result.length; level++) {
      for (let i = 0; i < result[level].length; i++) {
        const evo = result[level][i]
        
        // Obtener ID del Pokémon
        let id
        if (evo.isRegional) {
          // Para formas regionales, obtener ID de la forma base
          const baseName = evo.name.split('-')[0]
          try {
            const baseRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseName}/`)
            const baseData = await baseRes.json()
            id = baseData.id
          } catch (error) {
            // Si falla, intentar con el nombre completo
            const fallbackRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}/`)
            const fallbackData = await fallbackRes.json()
            id = fallbackData.id
          }
        } else {
          id = evo.url.split('/').slice(-2, -1)[0]
        }

        try {
          // Obtener datos del Pokémon
          const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
          const pokemonData = await pokemonRes.json()

          // Construir URL del sprite
          let spriteUrl
          if (evo.isRegional) {
            // Para formas regionales, intentar primero con el nombre completo
            spriteUrl = `https://play.pokemonshowdown.com/sprites/home/${evo.name}.png`
          } else {
            spriteUrl = `https://play.pokemonshowdown.com/sprites/home/${pokemonData.name}.png`
          }

          result[level][i] = {
            ...evo,
            id: parseInt(id),
            sprite: spriteUrl,
            types: pokemonData.types.map(t => t.type.name)
          }
        } catch (error) {
          console.error(`Error fetching data for ${evo.name}:`, error)
          result[level][i] = {
            ...evo,
            id: 0,
            sprite: null,
            types: []
          }
        }
      }
    }

    return result
  } catch (error) {
    console.error('Error:', error)
    return []
  }
}
