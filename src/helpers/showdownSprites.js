import { paradoxPokemon, hyphenPokemon } from './formatPoke'

// Pokémon que tienen 'mega' en su nombre pero no son mega evoluciones
const POKEMON_WITH_MEGA_IN_NAME = new Set(['meganium', 'yanmega'])

// Condiciones de limpieza de nombre para pokes con 2 megas
const DUAL_MEGA_FORMS = new Set([
  'charizard-mega-x',
  'charizard-mega-y',
  'mewtwo-mega-x',
  'mewtwo-mega-y',
])

// Mapeo de transformaciones de nombres para casos especiales
const NAME_TRANSFORMATIONS = {
  // GEN 1
  'nidoran-f': 'nidoranf',
  'nidoran-m': 'nidoranm',

  // GEN 2
  unown: 'unown',

  // GEN 3
  'deoxys-normal': 'deoxys',

  // GEN 4
  'shaymin-land': 'shaymin',

  // GEN 5
  'darmanitan-standard': 'darmanitan',
  'darmanitan-galar-zen': 'darmanitan-galarzen',
  'meloetta-aria': 'meloetta',

  // GEN 6
  'pyroar-male': 'pyroar',
  'zygarde-50': 'zygarde',

  // GEN 7
  'oricorio-pom-pom': 'oricorio-pompom',
  'oricorio-baile': 'oricorio',
  'necrozma-dawn': 'necrozma-dawnwings',
  'necrozma-dusk': 'necrozma-duskmane',

  // GEN 8
  'aegislash-shield': 'aegislash',
  'morpeko-full-belly': 'morpeko',
  'morpeko-hangry': 'morpeko-hangry',

  // GEN 9
  'maushold-family-of-four': 'maushold-four',
  'maushold-family-of-three': 'maushold',
  'dudunsparce-two-segment': 'dudunsparce',
  'dudunsparce-three-segment': 'dudunsparce-threesegment',

  // GENERALES
  'pikachu-rock-star': 'pikachu-rockstar',
  'pikachu-pop-star': 'pikachu-popstar',
  'keldeo-ordinary': 'keldeo',
  'mimikyu-disguised': 'mimikyu',
}

// Patrones de transformación para casos dinámicos
const TRANSFORMATION_PATTERNS = [
  {
    pattern: /^minior-.+-meteor$/,
    transform: (name) => name.replace('-meteor', ''),
  },
  {
    pattern: /^pikachu-.+-cap$/,
    transform: (name) => name.replace('-cap', ''),
  },
  {
    pattern: /-incarnate$/,
    transform: (name) => name.replace('-incarnate', ''),
  },
  {
    pattern: /-(male|female)$/,
    transform: (name) => name.replace(/-male$/, '').replace(/-female$/, '-f'),
  },
  {
    pattern: /^ogerpon-.+-mask$/,
    transform: (name) => name.replace('-mask', ''),
  },
  {
    pattern: /^squawkabilly-.+-plumage$/,
    transform: (name) => {
      const color = name.replace('squawkabilly-', '').replace('-plumage', '')
      return color === 'green' ? 'squawkabilly' : `squawkabilly-${color}`
    },
  },
  {
    pattern: /^tauros-paldea-/,
    transform: (name) => {
      const parts = name.split('-')
      return `${parts[0]}-${parts[1]}${parts[2]}`
    },
  },
]

// Mapeo específico para las Mega Evoluciones que necesitas
const MEGA_SPECIAL_IDS = {
  'raichu-mega-x': 10304,
  'raichu-mega-y': 10305,
  'absol-mega-z': 10307,
  'lucario-mega-z': 10310,
}

// Cache para nombres formateados
const formattedNameCache = new Map()

export const formatShowdownName = (pokemonName) => {
  if (formattedNameCache.has(pokemonName)) {
    return formattedNameCache.get(pokemonName)
  }

  let result = pokemonName

  if (POKEMON_WITH_MEGA_IN_NAME.has(pokemonName)) {
    formattedNameCache.set(pokemonName, result)
    return result
  }

  if (NAME_TRANSFORMATIONS[pokemonName]) {
    result = NAME_TRANSFORMATIONS[pokemonName]
    formattedNameCache.set(pokemonName, result)
    return result
  }

  for (const { pattern, transform } of TRANSFORMATION_PATTERNS) {
    if (pattern.test(pokemonName)) {
      result = transform(pokemonName)
      formattedNameCache.set(pokemonName, result)
      return result
    }
  }

  if (pokemonName.startsWith('urshifu-')) {
    result = pokemonName.replace('-single-strike', '').replace('-rapid-strike', '-rapidstrike')
    formattedNameCache.set(pokemonName, result)
    return result
  }

  if (pokemonName.startsWith('toxtricity')) {
    if (pokemonName.endsWith('-gmax')) {
      result = 'toxtricity-gmax'
    } else {
      result = pokemonName.replace('-amped', '').replace('-low-key', '-lowkey')
    }
    formattedNameCache.set(pokemonName, result)
    return result
  }

  if (paradoxPokemon.includes(pokemonName)) {
    result = pokemonName.startsWith('iron-')
      ? pokemonName.replace('iron-', 'iron').replace(/-/g, '')
      : pokemonName.replace(/-/g, '')
    formattedNameCache.set(pokemonName, result)
    return result
  }

  if (hyphenPokemon.includes(pokemonName)) {
    result = pokemonName.replace(/-/g, '')
    formattedNameCache.set(pokemonName, result)
    return result
  }

  if (DUAL_MEGA_FORMS.has(pokemonName)) {
    result = pokemonName.replace('-mega-', '-mega')
    formattedNameCache.set(pokemonName, result)
    return result
  }

  formattedNameCache.set(pokemonName, result)
  return result
}

export const shouldUseShowdown = (pokemonName) => {
  if (POKEMON_WITH_MEGA_IN_NAME.has(pokemonName)) {
    return true
  }

  if (pokemonName === 'cherrim-sunshine') return true

  if (pokemonName.endsWith('-mega')) return true
  if (DUAL_MEGA_FORMS.has(pokemonName)) return true

  // Las Mega Z también usan Showdown
  if (pokemonName === 'lucario-mega-z') return true
  if (pokemonName === 'absol-mega-z') return true
  if (pokemonName === 'raichu-mega-x') return true
  if (pokemonName === 'raichu-mega-y') return true

  if (
    pokemonName.includes('mega') &&
    !POKEMON_WITH_MEGA_IN_NAME.has(pokemonName) &&
    !pokemonName.endsWith('-mega') &&
    !DUAL_MEGA_FORMS.has(pokemonName)
  ) {
    console.warn('Mega Pokémon con formato no estándar:', pokemonName)
    return false
  }

  return true
}

// URLs base consolidadas
const SPRITE_URLS = {
  BASE: 'https://play.pokemonshowdown.com/sprites',
  ANI: {
    front: (name) => `/ani/${name}.gif`,
    frontShiny: (name) => `/ani-shiny/${name}.gif`,
    back: (name) => `/ani-back/${name}.gif`,
    backShiny: (name) => `/ani-back-shiny/${name}.gif`,
  },
  GEN5: {
    front: (name) => `/gen5/${name}.png`,
    frontShiny: (name) => `/gen5-shiny/${name}.png`,
    back: (name) => `/gen5-back/${name}.png`,
    backShiny: (name) => `/gen5-back-shiny/${name}.png`,
  },
  HOME: {
    front: (name) => `/home/${name}.png`,
    frontShiny: (name) => `/home-shiny/${name}.png`,
  },
}

const buildSpriteObject = (baseUrl, spriteGetter, name) => ({
  front_default: `${baseUrl}${spriteGetter.front(name)}`,
  front_shiny: `${baseUrl}${spriteGetter.frontShiny(name)}`,
  back_default: `${baseUrl}${spriteGetter.back(name)}`,
  back_shiny: `${baseUrl}${spriteGetter.backShiny(name)}`,
})

// Función para obtener el ID de artwork para Mega Evoluciones especiales
const getMegaArtworkId = (pokemonName) => {
  return MEGA_SPECIAL_IDS[pokemonName] || null
}

// Función para obtener URLs de artwork oficial
const getOfficialArtworkUrls = (pokemonName, pokemonId = null) => {
  // Primero verificar si es una Mega especial con ID propio
  const megaId = getMegaArtworkId(pokemonName)
  if (megaId) {
    console.log(`🎨 Usando ID especial para ${pokemonName}: ${megaId}`)
    return {
      front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${megaId}.png`,
      front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${megaId}.png`,
      back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${megaId}.png`,
      back_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${megaId}.png`,
    }
  }

  // Para Mega normales, usar el ID base del Pokémon
  const id = pokemonId || 0
  if (!id) {
    return {
      front_default: null,
      front_shiny: null,
      back_default: null,
      back_shiny: null,
    }
  }

  return {
    front_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    front_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${id}.png`,
    back_default: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`,
    back_shiny: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/${id}.png`,
  }
}

export const getShowdownSprites = (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)
  return buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.ANI, showdownName)
}

export const getShowdownSpritesWithFallback = (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  return {
    animated: buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.ANI, showdownName),
    fallback: {
      front_default: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.front(showdownName)}`,
      front_shiny: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.frontShiny(showdownName)}`,
      back_default: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.front(showdownName)}`,
      back_shiny: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.frontShiny(showdownName)}`,
    },
    officialArtwork: null,
  }
}

export const getShowdownSpritesWithArtwork = async (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  // Para las Mega especiales, obtener artwork con IDs específicos
  const officialArtwork = getOfficialArtworkUrls(pokemonName)

  console.log(`🎨 Artwork para ${pokemonName}:`, officialArtwork.front_default)

  return {
    animated: buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.ANI, showdownName),
    fallback: {
      front_default: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.front(showdownName)}`,
      front_shiny: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.frontShiny(showdownName)}`,
      back_default: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.front(showdownName)}`,
      back_shiny: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.frontShiny(showdownName)}`,
    },
    officialArtwork,
  }
}

// ✅ Sprites especiales para Cherrim Sunshine
export const CHERRIM_SUNSHINE_SPRITES = {
  front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/421.png',
  front_shiny:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/421.png',
  back_default:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/421.png',
  back_shiny:
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/421.png',
}

// Cache para verificación de sprites
const spriteCheckCache = new Map()
const CHECK_TIMEOUT = 5000

const checkSpriteExists = async (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  if (spriteCheckCache.has(showdownName)) {
    return spriteCheckCache.get(showdownName)
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT)

    const response = await fetch(`${SPRITE_URLS.BASE}${SPRITE_URLS.ANI.front(showdownName)}`, {
      method: 'HEAD',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const exists = response.ok
    spriteCheckCache.set(showdownName, exists)
    return exists
  } catch {
    spriteCheckCache.set(showdownName, false)
    return false
  }
}

const verifiedSpritesCache = new Map()

export const getShowdownSpritesWithCheck = async (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  if (verifiedSpritesCache.has(showdownName)) {
    return verifiedSpritesCache.get(showdownName)
  }

  const exists = await checkSpriteExists(pokemonName)

  const sprites = exists
    ? buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.ANI, showdownName)
    : buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.GEN5, showdownName)

  verifiedSpritesCache.set(showdownName, sprites)
  return sprites
}

export const getShowdownSpritesWithAllFallbacks = async (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)
  const officialArtwork = getOfficialArtworkUrls(pokemonName)
  const exists = await checkSpriteExists(pokemonName)

  return {
    animated: exists
      ? buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.ANI, showdownName)
      : buildSpriteObject(SPRITE_URLS.BASE, SPRITE_URLS.GEN5, showdownName),
    home: {
      front_default: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.front(showdownName)}`,
      front_shiny: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.frontShiny(showdownName)}`,
      back_default: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.front(showdownName)}`,
      back_shiny: `${SPRITE_URLS.BASE}${SPRITE_URLS.HOME.frontShiny(showdownName)}`,
    },
    officialArtwork,
  }
}
