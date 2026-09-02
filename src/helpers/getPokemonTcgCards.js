const getTcgSearchCandidates = (pokemonName) => {
  const cleaned = (pokemonName || '').trim().toLowerCase()

  if (!cleaned) return []

  const candidates = new Set()
  const directName = cleaned.replace(/\s+/g, '-')
  candidates.add(directName)

  const variantSuffixes = [
    '-gmax',
    '-alola',
    '-galar',
    '-hisui',
    '-paldea',
    '-mega',
    '-mega-x',
    '-mega-y',
    '-primal',
    '-partner',
    '-starter',
    '-totem',
    '-therian',
    '-origin',
    '-attack',
    '-defense',
    '-speed',
    '-land',
    '-sky',
    '-sunshine',
    '-rain',
    '-snow',
    '-resolute',
    '-belle',
    '-phd',
    '-libre',
    '-pirouette',
    '-incarnate',
    '-power-construct',
    '-10',
    '-50',
    '-complete',
  ]

  const baseVariant = variantSuffixes.reduce((result, suffix) => {
    if (result.endsWith(suffix)) {
      return result.slice(0, -suffix.length)
    }
    return result
  }, cleaned)

  if (baseVariant && baseVariant !== cleaned) {
    candidates.add(baseVariant)
  }

  const firstSegment = cleaned.split('-')[0]
  if (firstSegment && firstSegment !== cleaned) {
    candidates.add(firstSegment)
  }

  const aliases = {
    'mr-mime': 'mr-mime',
    'mr-rime': 'mr-rime',
    'mime-jr': 'mime-jr',
    'nidoran-f': 'nidoran-f',
    'nidoran-m': 'nidoran-m',
    'farfetchd': 'farfetchd',
    'sirfetchd': 'sirfetchd',
    'indeedee-m': 'indeedee-m',
    'indeedee-f': 'indeedee-f',
    'porygon-z': 'porygon-z',
    'rotom-heat': 'rotom-heat',
    'rotom-wash': 'rotom-wash',
    'rotom-frost': 'rotom-frost',
    'rotom-fan': 'rotom-fan',
    'rotom-mow': 'rotom-mow',
   'giratina-origin': 'giratina-origin',
    'eiscue-noice': 'eiscue-noice',
  }

  if (aliases[cleaned]) {
    candidates.add(aliases[cleaned])
  }

  return Array.from(candidates).filter(Boolean)
}

const waitToRetry = (milliseconds) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds)
  })

export const getPokemonTcgCards = async (pokemonName, { signal } = {}) => {
  const apiKey = import.meta.env.VITE_TCG_API_KEY

  if (!apiKey) {
    console.warn('Falta VITE_TCG_API_KEY para consultar Pokémon TCG.')
    return []
  }

  const searchNames = getTcgSearchCandidates(pokemonName)

  for (const searchName of searchNames) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        // Muchas cartas añaden texto al nombre del Pokémon (por ejemplo, "ex" o "V").
        // El comodín permite encontrar esos casos sin perder las coincidencias exactas.
        const params = new URLSearchParams({
          q: `name:${searchName}*`,
          pageSize: '50',
          orderBy: '-set.releaseDate',
        })
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?${params}`, {
          headers: {
            'X-Api-Key': apiKey,
          },
          signal,
        })

        if (!response.ok) {
          const canRetry = response.status === 429 || response.status >= 500
          if (canRetry && attempt < 2) {
            const retryAfter = Number(response.headers.get('Retry-After'))
            await waitToRetry(Number.isFinite(retryAfter) ? retryAfter * 1000 : 400 * (attempt + 1))
            continue
          }

          console.warn(`La API TCG respondió ${response.status} para ${searchName}.`)
          break
        }

        const data = await response.json()
        const cards = Array.isArray(data?.data) ? data.data : []

        const uniqueCards = cards
          .filter((card) => card?.images?.small)
          .sort((cardA, cardB) => {
            const dateA = cardA?.set?.releaseDate ? new Date(cardA.set.releaseDate).getTime() : 0
            const dateB = cardB?.set?.releaseDate ? new Date(cardB.set.releaseDate).getTime() : 0
            return dateB - dateA
          })
          .slice(0, 5)

        if (uniqueCards.length) {
          return uniqueCards
        }

        break
      } catch (error) {
        if (error?.name === 'AbortError') {
          return []
        }

        if (attempt < 2) {
          await waitToRetry(400 * (attempt + 1))
          continue
        }

        console.error(`Error consultando cartas TCG para ${searchName}:`, error)
      }
    }
  }

  return []
}
