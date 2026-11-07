const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
const DISPLAY_WORDS = {
  abilityshield: 'Ability Shield',
  airballoon: 'Air Balloon',
  assaultvest: 'Assault Vest',
  boosterenergy: 'Booster Energy',
  blackglasses: 'Black Glasses',
  choicescarf: 'Choice Scarf',
  choicespecs: 'Choice Specs',
  choiceband: 'Choice Band',
  clearamulet: 'Clear Amulet',
  covertcloak: 'Covert Cloak',
  ejectbutton: 'Eject Button',
  eviolite: 'Eviolite',
  focussash: 'Focus Sash',
  hadronengine: 'Hadron Engine',
  heavydutyboots: 'Heavy-Duty Boots',
  innerfocus: 'Inner Focus',
  intimidate: 'Intimidate',
  ironfist: 'Iron Fist',
  leftovers: 'Leftovers',
  lifeorb: 'Life Orb',
  loadeddice: 'Loaded Dice',
  lumberry: 'Lum Berry',
  magicguard: 'Magic Guard',
  mirrorherb: 'Mirror Herb',
  mysticwater: 'Mystic Water',
  orichalcumpulse: 'Orichalcum Pulse',
  protosynthesis: 'Protosynthesis',
  regenerator: 'Regenerator',
  rockslide: 'Rock Slide',
  rockytomb: 'Rock Tomb',
  rockyhelmet: 'Rocky Helmet',
  safetygoggles: 'Safety Goggles',
  sitrusberry: 'Sitrus Berry',
  supremeoverlord: 'Supreme Overlord',
  unseenfist: 'Unseen Fist',
  weaknesspolicy: 'Weakness Policy',
  trickroom: 'Trick Room',
  uturn: 'U-turn',
}

export function toPokemonId(value = '') {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, '')
}

function percentage(value, alreadyPercent = false) {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) return 0
  return alreadyPercent ? numericValue : numericValue * 100
}

function normalizeDistribution(distribution, alreadyPercent = false) {
  if (!distribution || typeof distribution !== 'object') return []

  return Object.entries(distribution)
    .map(([name, value]) => ({
      id: toPokemonId(name),
      name,
      usage: percentage(value, alreadyPercent),
    }))
    .filter((entry) => entry.usage > 0)
    .sort((left, right) => right.usage - left.usage)
}

function normalizeSpreads(spreads, alreadyPercent = false) {
  if (!spreads || typeof spreads !== 'object') return []

  return Object.entries(spreads)
    .map(([spread, value]) => {
      const [nature, evString] = spread.split(':')
      const evs = evString?.split('/').map(Number) ?? []

      return {
        nature: nature || 'Unknown',
        evs: Object.fromEntries(STAT_KEYS.map((key, index) => [key, evs[index] ?? 0])),
        usage: percentage(value, alreadyPercent),
      }
    })
    .filter((entry) => entry.usage > 0)
    .sort((left, right) => right.usage - left.usage)
}

function normalizeLegacyPokemon(pokemon, battles) {
  const rawCount = Number(pokemon['Raw count']) || 0
  return {
    usage: battles > 0 ? (rawCount / (battles * 2)) * 100 : 0,
    moves: normalizeDistribution(pokemon.Moves, true),
    items: normalizeDistribution(pokemon.Items, true),
    abilities: normalizeDistribution(pokemon.Abilities, true),
    teammates: normalizeDistribution(pokemon.Teammates, true),
    spreads: normalizeSpreads(pokemon.Spreads, true),
  }
}

function normalizePkmnPokemon(pokemon) {
  return {
    usage: percentage(pokemon.usage?.raw ?? pokemon.usage?.weighted ?? 0),
    moves: normalizeDistribution(pokemon.moves),
    items: normalizeDistribution(pokemon.items),
    abilities: normalizeDistribution(pokemon.abilities),
    teammates: normalizeDistribution(pokemon.teammates),
    spreads: normalizeSpreads(pokemon.spreads),
  }
}

export function normalizeFormatStats(raw) {
  const isLegacy = Boolean(raw?.data && raw?.info)
  const source = isLegacy ? raw.data : raw?.pokemon
  if (!source || typeof source !== 'object') {
    throw new Error('El conjunto de estadísticas no contiene datos de Pokémon.')
  }

  const battles = Number(raw.info?.['number of battles']) || 0
  return Object.fromEntries(
    Object.entries(source).map(([name, pokemon]) => [
      toPokemonId(name),
      {
        name,
        ...(isLegacy
          ? normalizeLegacyPokemon(pokemon, battles)
          : normalizePkmnPokemon(pokemon)),
      },
    ]),
  )
}

function displayName(id, nameMap = {}) {
  if (!id) return ''
  return (
    nameMap[id] ??
    DISPLAY_WORDS[id] ??
    id
      .replace(/([a-z])([0-9])/gi, '$1 $2')
      .replace(/^\w/, (letter) => letter.toUpperCase())
  )
}

function normalizePokekitDistribution(entries, nameMap = {}) {
  return (entries ?? [])
    .map((entry) => ({
      id: entry.id,
      name: displayName(entry.id, nameMap),
      usage: Number(entry.pct) || 0,
    }))
    .filter((entry) => entry.usage > 0)
    .sort((left, right) => right.usage - left.usage)
}

export function normalizePokeKitStats(raw, moveNames = {}) {
  if (!Array.isArray(raw?.pokemon)) {
    throw new Error('La respuesta de PokéKit no contiene la lista de Pokémon esperada.')
  }

  return Object.fromEntries(
    raw.pokemon.map((pokemon) => [
      toPokemonId(pokemon.id || pokemon.name),
      {
        name: pokemon.name,
        usage: Number(pokemon.usage) || 0,
        moves: normalizePokekitDistribution(pokemon.moves, moveNames),
        items: normalizePokekitDistribution(pokemon.items),
        abilities: normalizePokekitDistribution(pokemon.abilities),
        teammates: (pokemon.teammates ?? [])
          .map((teammate) => ({
            id: teammate.id,
            name: teammate.name,
            usage: Number(teammate.pct) || 0,
          }))
          .filter((teammate) => teammate.usage > 0)
          .sort((left, right) => right.usage - left.usage),
        spreads: (pokemon.spreads ?? [])
          .map((spread) => ({
            nature: spread.nature,
            evs: Object.fromEntries(
              STAT_KEYS.map((key, index) => [key, Number(spread.evs?.[index]) || 0]),
            ),
            usage: Number(spread.pct) || 0,
          }))
          .filter((spread) => spread.usage > 0)
          .sort((left, right) => right.usage - left.usage),
      },
    ]),
  )
}

function asOptions(value) {
  return Array.isArray(value) ? value : value == null ? [] : [value]
}

export function normalizePopularSets(raw, pokemonName) {
  const species = Object.entries(raw ?? {}).find(
    ([name]) => toPokemonId(name) === toPokemonId(pokemonName),
  )?.[1]
  if (!species || typeof species !== 'object') return []

  return Object.entries(species).map(([name, set]) => ({
    name,
    moves: asOptions(set.moves).map(asOptions),
    item: asOptions(set.item),
    ability: asOptions(set.ability),
    nature: asOptions(set.nature),
    evs: asOptions(set.evs),
  }))
}

export function normalizeShowdownMove(move) {
  return {
    name: move.name,
    type: move.type,
    category: move.category,
    power: move.basePower ?? 0,
    accuracy: move.accuracy === true ? null : move.accuracy,
    pp: move.pp,
    priority: move.priority ?? 0,
    target: move.target,
    description: move.shortDesc || move.desc || '',
  }
}
