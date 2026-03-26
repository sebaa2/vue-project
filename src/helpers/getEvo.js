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

    // LISTA DE FORMAS REGIONALES A EXCLUIR
    const excludedRegionalForms = [
      'perrserker', // Meowth de Galar
      'mr-mime-galar', // Mr. Mime de Galar
      'weezing-galar', // Weezing de Galar
      'marowak-alola', // Marowak de Alola
      'exeggutor-alola', // Exeggutor de Alola
      'raichu-alola', // Raichu de Alola
      //agregar mas
    ]

    // 5. MAPA DE POKÉMON CON MÚLTIPLES FORMAS EVOLUTIVAS
    const multipleFormsMap = {
      // ==================== GENERACIÓN 1 ====================
      tyrogue: {
        evolvesTo: [
          {
            name: 'hitmonlee',
            displayName: 'Hitmonlee',
            method: 'Nivel 20 (si Ataque > Defensa)',
            types: ['fighting'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/hitmonlee.png',
          },
          {
            name: 'hitmonchan',
            displayName: 'Hitmonchan',
            method: 'Nivel 20 (si Ataque < Defensa)',
            types: ['fighting'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/hitmonchan.png',
          },
          {
            name: 'hitmontop',
            displayName: 'Hitmontop',
            method: 'Nivel 20 (si Ataque = Defensa)',
            types: ['fighting'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/hitmontop.png',
          },
        ],
      },

      // ==================== GENERACIÓN 2 ====================
      // (Sin evoluciones especiales en esta generación para este mapa)

      // ==================== GENERACIÓN 3 ====================
      // (Sin evoluciones especiales en esta generación para este mapa)

      // ==================== GENERACIÓN 4 ====================
      magneton: {
        evolvesTo: [
          {
            name: 'magnezone',
            displayName: 'Magnezone',
            method: 'Nivel en campo magnético especial (o Piedra Trueno desde Gen 8)',
            types: ['electric', 'steel'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/magnezone.png',
          },
        ],
      },
      nosepass: {
        evolvesTo: [
          {
            name: 'probopass',
            displayName: 'Probopass',
            method: 'Nivel en campo magnético especial (o Piedra Trueno desde Leyendas Arceus)',
            types: ['rock', 'steel'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/probopass.png',
          },
        ],
      },

      // ==================== GENERACIÓN 5 ====================
      karrablast: {
        evolvesTo: [
          {
            name: 'escavalier',
            displayName: 'Escavalier',
            method: 'Intercambio con Shelmet',
            types: ['bug', 'steel'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/escavalier.png',
          },
        ],
      },
      shelmet: {
        evolvesTo: [
          {
            name: 'accelgor',
            displayName: 'Accelgor',
            method: 'Intercambio con Karrablast',
            types: ['bug'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/accelgor.png',
          },
        ],
      },

      // ==================== GENERACIÓN 6 ====================
      // (Sin evoluciones especiales en esta generación para este mapa)

      // ==================== GENERACIÓN 7 ====================
      cosmog: {
        evolvesTo: [
          {
            name: 'cosmoem',
            displayName: 'Cosmoem',
            method: 'Nivel 43',
            types: ['psychic'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/cosmoem.png',
          },
        ],
      },
      cosmoem: {
        evolvesTo: [
          {
            name: 'solgaleo',
            displayName: 'Solgaleo',
            method: 'Nivel 53 (durante el día)',
            style: 'Sol',
            types: ['psychic', 'steel'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/solgaleo.png',
          },
          {
            name: 'lunala',
            displayName: 'Lunala',
            method: 'Nivel 53 (durante la noche)',
            style: 'Luna',
            types: ['psychic', 'ghost'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/lunala.png',
          },
        ],
      },

      // ==================== GENERACIÓN 8 ====================
      kubfu: {
        evolvesTo: [
          {
            name: 'urshifu-single-strike',
            displayName: 'Urshifu Estilo Brusco',
            method: 'Manuscrito Sombras (antes Torre de la Oscuridad)',
            style: 'Brusco',
            types: ['fighting', 'dark'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/urshifu.png',
          },
          {
            name: 'urshifu-rapid-strike',
            displayName: 'Urshifu Estilo Fluido',
            method: 'Manuscrito aguas (antes Torre del Agua)',
            style: 'Fluido',
            types: ['fighting', 'water'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/urshifu-rapidstrike.png',
          },
        ],
      },
      toxel: {
        evolvesTo: [
          {
            name: 'toxtricity-amped',
            displayName: 'Toxtricity (Amped)',
            method: 'Nivel 30 (Naturaleza: Fuerte, Osada, Firme, etc.)',
            style: 'Amped',
            types: ['electric', 'poison'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/toxtricity.png',
          },
          {
            name: 'toxtricity-low-key',
            displayName: 'Toxtricity (Low Key)',
            method: 'Nivel 30 (Naturaleza: Miedosa, Modest, Calm, etc.)',
            style: 'Low Key',
            types: ['electric', 'poison'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/toxtricity-lowkey.png',
          },
        ],
      },
      applin: {
        evolvesTo: [
          {
            name: 'dipplin',
            displayName: 'Dipplin',
            method: 'Usar: Manzana Melosa',
            types: ['grass', 'dragon'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/dipplin.png',
          },
        ],
      },

      // ==================== GENERACIÓN 9 ====================
      happiny: {
        evolvesTo: [
          {
            name: 'chansey',
            displayName: 'Chansey',
            method: 'Nivel (durante el día) con Piedra Oval equipada',
            types: ['normal'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/chansey.png',
          },
        ],
      },
      dipplin: {
        evolvesTo: [
          {
            name: 'hydrapple',
            displayName: 'Hydrapple',
            method: 'Nivel conociendo el movimiento Bramido Dragón',
            types: ['grass', 'dragon'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/hydrapple.png',
          },
        ],
      },
      primeape: {
        evolvesTo: [
          {
            name: 'annihilape',
            displayName: 'Annihilape',
            method: 'Usar Puño Furia 20 veces + subir 1 nivel',
            types: ['fighting', 'ghost'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/annihilape.png',
          },
        ],
      },
      gimmighoul: {
        evolvesTo: [
          {
            name: 'gholdengo',
            displayName: 'Gholdengo',
            method: 'Recolectar 999 monedas Gimmighoul',
            types: ['steel', 'ghost'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/gholdengo.png',
          },
        ],
      },
      girafarig: {
        evolvesTo: [
          {
            name: 'farigiraf',
            displayName: 'Farigiraf',
            method: 'Aprender Láser Doble + subir 1 nivel',
            types: ['normal', 'psychic'],
            sprite: 'https://play.pokemonshowdown.com/sprites/home/farigiraf.png',
          },
        ],
      },
      // Nota: Dunsparce no está incluido porque se maneja con la lógica existente
      // en EvolutionChain.vue (isDudunsparce, getDudunsparceSprite, etc.)
    }

    // 6. Procesar cadena
    const result = []

    const process = async (chain, level = 0, method = null) => {
      if (!result[level]) result[level] = []

      const pokemonName = chain.species.name

      // Verificar si es un Pokémon con múltiples formas
      const hasMultipleForms = multipleFormsMap[pokemonName]

      // Agregar Pokémon base (solo si no es una forma especial y no está excluido)
      if (
        !pokemonName.includes('urshifu') &&
        !pokemonName.includes('toxtricity') &&
        !pokemonName.includes('cosmoem') &&
        !pokemonName.includes('solgaleo') &&
        !pokemonName.includes('lunala') &&
        !excludedRegionalForms.includes(pokemonName)
      ) {
        // Excluir formas regionales
        const basePokemon = {
          name: pokemonName,
          method: method,
          url: chain.species.url,
        }

        const exists = result[level].some((e) => e.name === pokemonName)
        if (!exists) {
          result[level].push(basePokemon)
        }
      }

      // Procesar evoluciones
      for (const evo of chain.evolves_to) {
        const evoMethod = await getMethod(evo.evolution_details)
        const evoName = evo.species.name

        // Verificar si la evolución es una forma regional excluida
        const isExcludedRegional = excludedRegionalForms.includes(evoName)

        // ===========================================
        // CASO ESPECIAL: Pokémon con múltiples formas
        // ===========================================
        if (hasMultipleForms) {
          // NO agregamos la evolución base, solo las formas múltiples
          const forms = multipleFormsMap[pokemonName].evolvesTo

          for (const form of forms) {
            const formExists = result[level + 1]?.some((e) => e.name === form.name)
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
                pokemonName: form.name,
              })
            }
          }
        }
        // ===========================================
        // CASO NORMAL: Agregar evolución base (solo si no es excluida)
        // ===========================================
        else if (!isExcludedRegional) {
          // Solo agregar si no es una forma regional excluida
          const baseEvoExists = result[level + 1]?.some((e) => e.name === evoName)
          if (!baseEvoExists) {
            if (!result[level + 1]) result[level + 1] = []
            result[level + 1].push({
              name: evoName,
              method: evoMethod,
              url: evo.species.url,
            })
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
        // CASO: Pokémon normales
        // ===========================================
        if (!evo.sprite) {
          const id = evo.url.split('/').slice(-2, -1)[0]

          try {
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
            const pokemonData = await pokemonRes.json()

            result[level][i] = {
              ...evo,
              id: parseInt(id),
              sprite: `https://play.pokemonshowdown.com/sprites/home/${pokemonData.name}.png`,
              types: pokemonData.types.map((t) => t.type.name),
            }
          } catch (error) {
            console.error(`Error fetching data for ${evo.name}:`, error)
            result[level][i] = {
              ...evo,
              id: 0,
              sprite: null,
              types: [],
            }
          }
        }
      }
    }

    // Limpiar resultados vacíos y eliminar duplicados
    const cleanedResult = result
      .filter((level) => level && level.length > 0)
      .map((level) => {
        // Eliminar duplicados por nombre
        const uniqueNames = new Set()
        return level.filter((evo) => {
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
