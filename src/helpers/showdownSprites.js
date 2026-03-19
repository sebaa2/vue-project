import { paradoxPokemon, hyphenPokemon } from './formatPoke'

// Pokémon que tienen 'mega' en su nombre pero no son mega evoluciones
const POKEMON_WITH_MEGA_IN_NAME = ['meganium', 'yanmega']

const checkSpriteExists = async (pokemonName) => {
  try {
    const showdownName = formatShowdownName(pokemonName)
    const response = await fetch(
      `https://play.pokemonshowdown.com/sprites/ani/${showdownName}.gif`,
      { method: 'HEAD' },
    )
    return response.ok
  } catch {
    return false
  }
}

// condiciones de limpieza de nombre para pokes con 2 megas
const DUAL_MEGA_FORMS = ['charizard-mega-x', 'charizard-mega-y', 'mewtwo-mega-x', 'mewtwo-mega-y']

//condiciones de nombres
export const formatShowdownName = (pokemonName) => {
  // Preservar nombres de Pokémon que contienen 'mega' pero no son mega evoluciones
  if (POKEMON_WITH_MEGA_IN_NAME.includes(pokemonName)) {
    return pokemonName
  }

  // GEN 1
  if (pokemonName === 'nidoran-f') return 'nidoranf'
  if (pokemonName === 'nidoran-m') return 'nidoranm'

  // GEN 2
  if (pokemonName === 'unown') return pokemonName.replace(/-/g, '')

  // GEN 3
  if (pokemonName === 'deoxys-normal') return 'deoxys'

  // GEN 4
  if (pokemonName === 'shaymin-land') return 'shaymin'

  // GEN 5
  if (pokemonName === 'darmanitan-standard') return 'darmanitan'
  if (pokemonName === 'darmanitan-galar-zen') return 'darmanitan-galarzen'

  // GEN 6
  if (pokemonName === 'pyroar-male') return 'pyroar'

  // GEN 7
  // Oricorio
  if (pokemonName === 'oricorio-pom-pom') return 'oricorio-pompom'
  if (pokemonName === 'oricorio-baile') return 'oricorio'

  // Minior
  if (pokemonName === 'minior-red-meteor') return 'minior'
  if (pokemonName.startsWith('minior-') && pokemonName.endsWith('-meteor')) {
    return pokemonName.replace('-meteor', '')
  }

  // Necrozma
  if (pokemonName === 'necrozma-dawn') return 'necrozma-dawnwings'
  if (pokemonName === 'necrozma-dusk') return 'necrozma-duskmane'

  // GEN 8
  // Urshifu
  if (pokemonName.startsWith('urshifu-')) {
    return pokemonName.replace('-single-strike', '').replace('-rapid-strike', '-rapidstrike')
  }
  if(pokemonName === 'aegislash-shield') return 'aegislash'

  // Toxtricity
  if (pokemonName.startsWith('toxtricity')) {
    if (pokemonName.endsWith('-gmax')) return 'toxtricity-gmax'
    return pokemonName.replace('-amped', '').replace('-low-key', '-lowkey')
  }

  // Morpeko (FIX bug)
  if (pokemonName === 'morpeko-full-belly') return 'morpeko'
  if (pokemonName === 'morpeko-hangry') return 'morpeko-hangry'

  // Darmanitan ya manejado arriba

  // GEN 9
  // Maushold
  if (pokemonName === 'maushold-family-of-four') return 'maushold-four'
  if (pokemonName === 'maushold-family-of-three') return 'maushold'

  if (pokemonName === 'dudunsparce-two-segment') {
    return 'dudunsparce'
  }
  if (pokemonName === 'dudunsparce-three-segment') return 'dudunsparce-threesegment'

  // Ogerpon
  if (pokemonName.startsWith('ogerpon-') && pokemonName.includes('-mask')) {
    return pokemonName.replace('-mask', '')
  }

  // Paradox
  if (paradoxPokemon.includes(pokemonName)) {
    return pokemonName.startsWith('iron-')
      ? pokemonName.replace('iron-', 'iron').replace('-', '')
      : pokemonName.replace('-', '')
  }

  // Tauros Paldea
  if (pokemonName.startsWith('tauros-paldea-')) {
    const parts = pokemonName.split('-')
    return parts[0] + '-' + parts[1] + parts[2]
  }

  // GENERALES (todas las generaciones)

  // Pikachu
  if (pokemonName === 'pikachu-rock-star') return 'pikachu-rockstar'
  if (pokemonName === 'pikachu-pop-star') return 'pikachu-popstar'
  if (pokemonName.startsWith('pikachu-') && pokemonName.endsWith('-cap')) {
    return pokemonName.replace('-cap', '')
  }

  // Keldeo
  if (pokemonName === 'keldeo-ordinary') return 'keldeo'

  // Mimikyu
  if (pokemonName === 'mimikyu-disguised') return 'mimikyu'

  // Formas incarnate
  if (pokemonName.endsWith('-incarnate')) {
    return pokemonName.replace('-incarnate', '')
  }

  // Género
  if (pokemonName.endsWith('-male') || pokemonName.endsWith('-female')) {
    return pokemonName.replace('-male', '').replace('-female', '-f')
  }

  // Hyphen general
  if (hyphenPokemon.includes(pokemonName)) {
    return pokemonName.replace(/-/g, '')
  }

  // Megas
  if (DUAL_MEGA_FORMS.includes(pokemonName)) {
    return pokemonName.replace('-mega-', '-mega')
  }
  if (pokemonName.endsWith('-mega')) {
    return pokemonName
  }

  // DEFAULT
  return pokemonName
}

export const shouldUseShowdown = (pokemonName) => {
  // Pokémon que tienen 'mega' en su nombre pero no son mega evoluciones
  if (POKEMON_WITH_MEGA_IN_NAME.includes(pokemonName)) {
    return true
  }

  // Cherrim sunshine siempre usa Showdown
  if (pokemonName === 'cherrim-sunshine') return true

  // Todos los mega Pokémon con una sola forma (-mega) usan Showdown
  if (pokemonName.endsWith('-mega')) return true

  // Los mega con dos formas (mega-x, mega-y) usan Showdown
  if (DUAL_MEGA_FORMS.includes(pokemonName)) return true

  // Excluir mega evoluciones (pero no los que tienen 'mega' en su nombre)
  if (
    pokemonName.includes('mega') &&
    !POKEMON_WITH_MEGA_IN_NAME.includes(pokemonName) &&
    !pokemonName.endsWith('-mega') &&
    !DUAL_MEGA_FORMS.includes(pokemonName)
  ) {
    console.log('Mega Pokémon con formato no estándar:', pokemonName)
    return false
  }

  // Todos los demás usan Showdown
  return true
}

export const getShowdownSprites = (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  return {
    front_default: `https://play.pokemonshowdown.com/sprites/ani/${showdownName}.gif`,
    front_shiny: `https://play.pokemonshowdown.com/sprites/ani-shiny/${showdownName}.gif`,
    back_default: `https://play.pokemonshowdown.com/sprites/ani-back/${showdownName}.gif`,
    back_shiny: `https://play.pokemonshowdown.com/sprites/ani-back-shiny/${showdownName}.gif`,
  }
}

// Sprites especiales para Cherrim Sunshine
export const CHERRIM_SUNSHINE_SPRITES = {
  front_default: 'https://play.pokemonshowdown.com/sprites/ani/cherrim-sunshine.gif',
  front_shiny: 'https://play.pokemonshowdown.com/sprites/ani-shiny/cherrim-sunshine.gif',
  back_default: 'https://play.pokemonshowdown.com/sprites/ani-back/cherrim-sunshine.gif',
  back_shiny: 'https://play.pokemonshowdown.com/sprites/ani-back-shiny/cherrim-sunshine.gif',
}

// Cache para verificación de sprites
const spriteCache = new Map()

export const getShowdownSpritesWithCheck = async (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)

  // Verificar si ya tenemos el resultado en caché
  if (spriteCache.has(showdownName)) {
    return spriteCache.get(showdownName)
  }

  const baseUrl = 'https://play.pokemonshowdown.com/sprites'
  const exists = await checkSpriteExists(pokemonName)

  let sprites
  if (exists) {
    sprites = {
      front_default: `${baseUrl}/ani/${showdownName}.gif`,
      front_shiny: `${baseUrl}/ani-shiny/${showdownName}.gif`,
      back_default: `${baseUrl}/ani-back/${showdownName}.gif`,
      back_shiny: `${baseUrl}/ani-back-shiny/${showdownName}.gif`,
    }
  } else {
    console.log(`Usando sprite estático para: ${pokemonName}`)
    // Fallback a sprites estáticos de Gen 5
    sprites = {
      front_default: `${baseUrl}/gen5/${showdownName}.png`,
      front_shiny: `${baseUrl}/gen5-shiny/${showdownName}.png`,
      back_default: `${baseUrl}/gen5-back/${showdownName}.png`,
      back_shiny: `${baseUrl}/gen5-back-shiny/${showdownName}.png`,
    }
  }

  // Guardar en caché
  spriteCache.set(showdownName, sprites)
  return sprites
}

// ahora si
export const getShowdownSpritesWithFallback = (pokemonName) => {
  const showdownName = formatShowdownName(pokemonName)
  const baseUrl = 'https://play.pokemonshowdown.com/sprites'

  // Primero intentamos con animados
  const animatedSprites = {
    front_default: `${baseUrl}/ani/${showdownName}.gif`,
    front_shiny: `${baseUrl}/ani-shiny/${showdownName}.gif`,
    back_default: `${baseUrl}/ani-back/${showdownName}.gif`,
    back_shiny: `${baseUrl}/ani-back-shiny/${showdownName}.gif`,
  }

  // También preparamos los fallback de home
  const homeSprites = {
    front_default: `${baseUrl}/home/${showdownName}.png`,
    front_shiny: `${baseUrl}/home-shiny/${showdownName}.png`,
    back_default: `${baseUrl}/home/${showdownName}.png`,
    back_shiny: `${baseUrl}/home-shiny/${showdownName}.png`,
  }

  // Devolvemos ambos y manejamos el error en el componente
  return {
    animated: animatedSprites,
    fallback: homeSprites,
  }
}
