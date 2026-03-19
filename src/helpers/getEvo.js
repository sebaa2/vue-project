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

    // 4. Mapa de formas regionales
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

    // 5. MAPA DE POKÉMON CON MÚLTIPLES FORMAS EVOLUTIVAS
    const multipleFormsMap = {
      'kubfu': {
        evolvesTo: [
          {
            name: 'urshifu-single-strike',
            displayName: 'Urshifu Estilo Brusco',
            method: 'Torre de la Oscuridad',
            style: 'Brusco',
            types: ['fighting', 'dark'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/urshifu.png'
          },
          {
            name: 'urshifu-rapid-strike',
            displayName: 'Urshifu Estilo Fluido',
            method: 'Torre del Agua',
            style: 'Fluido',
            types: ['fighting', 'water'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/urshifu-rapidstrike.png'
          }
        ]
      },
      'toxel': {
        evolvesTo: [
          {
            name: 'toxtricity-amped',
            displayName: 'Toxtricity (Amped)',
            method: 'Nivel 30 (Naturaleza: Fuerte, Osada, Firme, etc.)',
            style: 'Amped',
            types: ['electric', 'poison'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/toxtricity.png'
          },
          {
            name: 'toxtricity-low-key',
            displayName: 'Toxtricity (Low Key)',
            method: 'Nivel 30 (Naturaleza: Miedosa, Modest, Calm, etc.)',
            style: 'Low Key',
            types: ['electric', 'poison'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/toxtricity-lowkey.png'
          }
        ]
      },
      'cosmog': {
        evolvesTo: [
          {
            name: 'cosmoem',
            displayName: 'Cosmoem',
            method: 'Nivel 43',
            style: 'Crisálida',
            types: ['psychic'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/cosmoem.png'
          }
        ]
      },
      'cosmoem': {
        evolvesTo: [
          {
            name: 'solgaleo',
            displayName: 'Solgaleo',
            method: 'Nivel 53 (durante el día)',
            style: 'Sol',
            types: ['psychic', 'steel'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/solgaleo.png'
          },
          {
            name: 'lunala',
            displayName: 'Lunala',
            method: 'Nivel 53 (durante la noche)',
            style: 'Luna',
            types: ['psychic', 'ghost'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/lunala.png'
          }
        ]
      }
    }

    // 6. Procesar cadena
    const result = []

    const process = async (chain, level = 0, method = null) => {
      if (!result[level]) result[level] = []

      const pokemonName = chain.species.name
      
      // Verificar si es un Pokémon con múltiples formas
      const hasMultipleForms = multipleFormsMap[pokemonName]
      
      // Agregar Pokémon base (solo si no es una forma especial)
      if (!pokemonName.includes('urshifu') && 
          !pokemonName.includes('toxtricity') &&
          !pokemonName.includes('cosmoem') &&
          !pokemonName.includes('solgaleo') &&
          !pokemonName.includes('lunala')) {
        const basePokemon = {
          name: pokemonName,
          method: method,
          url: chain.species.url,
        }
        
        const exists = result[level].some(e => e.name === pokemonName)
        if (!exists) {
          result[level].push(basePokemon)
        }
      }

      // Procesar evoluciones
      for (const evo of chain.evolves_to) {
        const evoMethod = await getMethod(evo.evolution_details)
        const evoName = evo.species.name
        
        // ===========================================
        // CASO ESPECIAL: Pokémon con múltiples formas
        // ===========================================
        if (hasMultipleForms) {
          // NO agregamos la evolución base, solo las formas múltiples
          const forms = multipleFormsMap[pokemonName].evolvesTo
          
          for (const form of forms) {
            const formExists = result[level + 1]?.some(e => e.name === form.name)
            if (!formExists) {
              if (!result[level + 1]) result[level + 1] = []
              
              result[level + 1].push({
                name: form.name,
                displayName: form.displayName,
                method: form.method,
                style: form.style,
                types: form.types,
                sprite: form.sprite,
                url: `https://pokeapi.co/api/v2/pokemon/${form.name}/`,
                isSpecialForm: true,
                region: form.style,
                isRegional: true,
                pokemonName: form.name
              })
            }
          }
        } 
        // ===========================================
        // CASO NORMAL: Agregar evolución base
        // ===========================================
        else {
          const baseEvoExists = result[level + 1]?.some(e => e.name === evoName)
          if (!baseEvoExists) {
            if (!result[level + 1]) result[level + 1] = []
            result[level + 1].push({
              name: evoName,
              method: evoMethod,
              url: evo.species.url,
            })
          }
        }
        
        // ===========================================
        // FORMAS REGIONALES (solo si no es caso especial)
        // ===========================================
        if (!hasMultipleForms && 
            regionalFormsMap[pokemonName] && 
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
                url: `https://pokeapi.co/api/v2/pokemon/${form}/`,
                isRegional: true,
                region: region,
                pokemonName: form
              })
            }
          }
        }
        
        // Procesar siguientes evoluciones recursivamente
        await process(evo, level + 1, evoMethod)
      }
    }

    await process(evolutionData.chain)

    // ===========================================
    // 7. OBTENER SPRITES Y TIPOS PARA POKÉMON NORMALES
    // ===========================================
    for (let level = 0; level < result.length; level++) {
      for (let i = 0; i < result[level].length; i++) {
        const evo = result[level][i]
        
        // Saltar si ya tiene sprite y tipos definidos (formas especiales)
        if (evo.sprite && evo.types && evo.types.length > 0) continue
        
        // ===========================================
        // CASO: Formas regionales sin sprite
        // ===========================================
        if (evo.isRegional && !evo.sprite) {
          const baseName = evo.name.split('-')[0]
          try {
            const baseRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseName}/`)
            const baseData = await baseRes.json()
            
            result[level][i] = {
              ...evo,
              id: baseData.id,
              sprite: `https://play.pokemonshowdown.com/sprites/home/${evo.name}.png`,
              types: baseData.types.map(t => t.type.name)
            }
          } catch (error) {
            try {
              const fallbackRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}/`)
              const fallbackData = await fallbackRes.json()
              
              result[level][i] = {
                ...evo,
                id: fallbackData.id,
                sprite: `https://play.pokemonshowdown.com/sprites/home/${evo.name}.png`,
                types: fallbackData.types.map(t => t.type.name)
              }
            } catch (error2) {
              result[level][i] = {
                ...evo,
                id: 0,
                sprite: null,
                types: []
              }
            }
          }
        } 
        
        // ===========================================
        // CASO: Pokémon normales
        // ===========================================
        else if (!evo.sprite) {
          const id = evo.url.split('/').slice(-2, -1)[0]
          
          try {
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
            const pokemonData = await pokemonRes.json()
            
            result[level][i] = {
              ...evo,
              id: parseInt(id),
              sprite: `https://play.pokemonshowdown.com/sprites/home/${pokemonData.name}.png`,
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
    }

    // Limpiar resultados vacíos y eliminar duplicados
    const cleanedResult = result
      .filter(level => level && level.length > 0)
      .map(level => {
        // Eliminar duplicados por nombre
        const uniqueNames = new Set()
        return level.filter(evo => {
          if (uniqueNames.has(evo.name)) return false
          uniqueNames.add(evo.name)
          return true
        })
      })

    console.log('Resultado final:', cleanedResult) // Para debug
    return cleanedResult
    
  } catch (error) {
    console.error('Error en getEvolutionChain:', error)
    return []
  }
}

