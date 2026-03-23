import { paradoxPokemon, hyphenPokemon } from './formatPoke'

// Constantes
const POKEMON_WITH_MEGA_IN_NAME = new Set(['meganium', 'yanmega'])
const DUAL_MEGA_FORMS = new Set([
  'charizard-mega-x',
  'charizard-mega-y',
  'mewtwo-mega-x',
  'mewtwo-mega-y',
])

const SPRITE_BASE_URL = 'https://play.pokemonshowdown.com/sprites'

// Mapas de transformaciones para mejor rendimiento
const NAME_TRANSFORMATIONS = new Map([
  // GEN 1
  ['nidoran-f', 'nidoranf'],
  ['nidoran-m', 'nidoranm'],

  // GEN 2
  ['unown', 'unown'],

  // GEN 3
  ['deoxys-normal', 'deoxys'],

  // GEN 4
  ['shaymin-land', 'shaymin'],

  // GEN 5
  ['darmanitan-standard', 'darmanitan'],
  ['darmanitan-galar-zen', 'darmanitan-galarzen'],

  // GEN 6
  ['pyroar-male', 'pyroar'],
  ['zygarde-50', 'zygarde'],

  // GEN 7
  ['oricorio-pom-pom', 'oricorio-pompom'],
  ['oricorio-baile', 'oricorio'],
  ['minior-red-meteor', 'minior'],
  ['necrozma-dawn', 'necrozma-dawnwings'],
  ['necrozma-dusk', 'necrozma-duskmane'],

  // GEN 8
  ['aegislash-shield', 'aegislash'],
  ['morpeko-full-belly', 'morpeko'],
  ['morpeko-hangry', 'morpeko-hangry'],

  // GEN 9
  ['maushold-family-of-four', 'maushold-four'],
  ['maushold-family-of-three', 'maushold'],
  ['dudunsparce-two-segment', 'dudunsparce'],
  ['dudunsparce-three-segment', 'dudunsparce-threesegment'],

  // Especiales
  ['pikachu-rock-star', 'pikachu-rockstar'],
  ['pikachu-pop-star', 'pikachu-popstar'],
  ['keldeo-ordinary', 'keldeo'],
  ['mimikyu-disguised', 'mimikyu'],
])

// Patrones de transformación (ordenados por prioridad)
const TRANSFORMATION_PATTERNS = [
  // Squawkabilly (patrón específico)
  {
    test: (name) => name.startsWith('squawkabilly-') && name.endsWith('-plumage'),
    transform: (name) => {
      const color = name.slice(13, -8) // 'squawkabilly-'.length = 13, '-plumage'.length = 8
      return color === 'green' ? 'squawkabilly' : `squawkabilly-${color}`
    },
  },
  // Urshifu
  {
    test: (name) => name.startsWith('urshifu-'),
    transform: (name) =>
      name.replace('-single-strike', '').replace('-rapid-strike', '-rapidstrike'),
  },
  // Toxtricity
  {
    test: (name) => name.startsWith('toxtricity'),
    transform: (name) => {
      if (name.endsWith('-gmax')) return 'toxtricity-gmax'
      return name.replace('-amped', '').replace('-low-key', '-lowkey')
    },
  },
  // Ogerpon
  {
    test: (name) => name.startsWith('ogerpon-') && name.includes('-mask'),
    transform: (name) => name.replace('-mask', ''),
  },
  // Minior (patrón general)
  {
    test: (name) => name.startsWith('minior-') && name.endsWith('-meteor'),
    transform: (name) => name.replace('-meteor', ''),
  },
  // Pikachu caps
  {
    test: (name) => name.startsWith('pikachu-') && name.endsWith('-cap'),
    transform: (name) => name.replace('-cap', ''),
  },
  // Tauros Paldea
  {
    test: (name) => name.startsWith('tauros-paldea-'),
    transform: (name) => {
      const parts = name.split('-')
      return `${parts[0]}-${parts[1]}${parts[2]}`
    },
  },
  // Género
  {
    test: (name) => name.endsWith('-male') || name.endsWith('-female'),
    transform: (name) => name.replace('-male', '').replace('-female', '-f'),
  },
  // Incarnate forms
  {
    test: (name) => name.endsWith('-incarnate'),
    transform: (name) => name.slice(0, -10), // remover '-incarnate'
  },
]

// Función auxiliar para transformaciones simples
const applySimpleTransformations = (name) => {
  // Megas duales
  if (DUAL_MEGA_FORMS.has(name)) {
    return name.replace('-mega-', '-mega')
  }

  // Paradox Pokémon
  if (paradoxPokemon.includes(name)) {
    return name.startsWith('iron-')
      ? name.replace('iron-', 'iron').replace(/-/g, '')
      : name.replace(/-/g, '')
  }

  // Hyphen Pokémon general
  if (hyphenPokemon.includes(name)) {
    return name.replace(/-/g, '')
  }

  return null
}

export const formatShowdownName = (pokemonName) => {
  // Casos especiales rápidos
  if (POKEMON_WITH_MEGA_IN_NAME.has(pokemonName)) {
    return pokemonName
  }

  if (pokemonName.endsWith('-mega')) {
    return pokemonName
  }

  // Transformaciones directas
  if (NAME_TRANSFORMATIONS.has(pokemonName)) {
    const transformed = NAME_TRANSFORMATIONS.get(pokemonName)
    // Si es 'unown', remover guiones
    return pokemonName === 'unown' ? transformed.replace(/-/g, '') : transformed
  }

  // Aplicar patrones de transformación
  for (const pattern of TRANSFORMATION_PATTERNS) {
    if (pattern.test(pokemonName)) {
      return pattern.transform(pokemonName)
    }
  }

  // Transformaciones simples
  const simpleTransform = applySimpleTransformations(pokemonName)
  if (simpleTransform !== null) {
    return simpleTransform
  }

  return pokemonName
}

export const shouldUseShowdown = (pokemonName) => {
  // Usar Set para búsquedas O(1)
  if (POKEMON_WITH_MEGA_IN_NAME.has(pokemonName)) return true
  if (pokemonName === 'cherrim-sunshine') return true
  if (pokemonName.endsWith('-mega')) return true
  if (DUAL_MEGA_FORMS.has(pokemonName)) return true

  // Excluir mega evoluciones no estándar
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

// Cache con límite de tamaño para evitar memory leak
const spriteCache = new Map()
const MAX_CACHE_SIZE = 500

const setSpriteCache = (key, value) => {
  if (spriteCache.size >= MAX_CACHE_SIZE) {
    // Eliminar el primer elemento (más antiguo)
    const firstKey = spriteCache.keys().next().value
    spriteCache.delete(firstKey)
  }
  spriteCache.set(key, value)
}

const checkSpriteExists = async (pokemonName) => {
  try {
    const showdownName = formatShowdownName(pokemonName)
    const response = await fetch(`${SPRITE_BASE_URL}/ani/${showdownName}.gif`, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export const getShowdownSprites = (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  return {
    front_default: `${SPRITE_BASE_URL}/ani/${showdownName}.gif`,
    front_shiny: `${SPRITE_BASE_URL}/ani-shiny/${showdownName}.gif`,
    back_default: `${SPRITE_BASE_URL}/ani-back/${showdownName}.gif`,
    back_shiny: `${SPRITE_BASE_URL}/ani-back-shiny/${showdownName}.gif`,
  }
}

export const CHERRIM_SUNSHINE_SPRITES = {
  front_default: `${SPRITE_BASE_URL}/ani/cherrim-sunshine.gif`,
  front_shiny: `${SPRITE_BASE_URL}/ani-shiny/cherrim-sunshine.gif`,
  back_default: `${SPRITE_BASE_URL}/ani-back/cherrim-sunshine.gif`,
  back_shiny: `${SPRITE_BASE_URL}/ani-back-shiny/cherrim-sunshine.gif`,
}

export const getShowdownSpritesWithCheck = async (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  if (spriteCache.has(showdownName)) {
    return spriteCache.get(showdownName)
  }

  const exists = await checkSpriteExists(pokemonName)

  const sprites = exists
    ? {
        front_default: `${SPRITE_BASE_URL}/ani/${showdownName}.gif`,
        front_shiny: `${SPRITE_BASE_URL}/ani-shiny/${showdownName}.gif`,
        back_default: `${SPRITE_BASE_URL}/ani-back/${showdownName}.gif`,
        back_shiny: `${SPRITE_BASE_URL}/ani-back-shiny/${showdownName}.gif`,
      }
    : {
        front_default: `${SPRITE_BASE_URL}/gen5/${showdownName}.png`,
        front_shiny: `${SPRITE_BASE_URL}/gen5-shiny/${showdownName}.png`,
        back_default: `${SPRITE_BASE_URL}/gen5-back/${showdownName}.png`,
        back_shiny: `${SPRITE_BASE_URL}/gen5-back-shiny/${showdownName}.png`,
      }

  setSpriteCache(showdownName, sprites)
  return sprites
}

export const getShowdownSpritesWithFallback = (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  return {
    animated: {
      front_default: `${SPRITE_BASE_URL}/ani/${showdownName}.gif`,
      front_shiny: `${SPRITE_BASE_URL}/ani-shiny/${showdownName}.gif`,
      back_default: `${SPRITE_BASE_URL}/ani-back/${showdownName}.gif`,
      back_shiny: `${SPRITE_BASE_URL}/ani-back-shiny/${showdownName}.gif`,
    },
    fallback: {
      front_default: `${SPRITE_BASE_URL}/home/${showdownName}.png`,
      front_shiny: `${SPRITE_BASE_URL}/home-shiny/${showdownName}.png`,
      back_default: `${SPRITE_BASE_URL}/home/${showdownName}.png`,
      back_shiny: `${SPRITE_BASE_URL}/home-shiny/${showdownName}.png`,
    },
  }
}
