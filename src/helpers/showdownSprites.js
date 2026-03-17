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

// condiciones de limpieza para pokes con 2 megas
const DUAL_MEGA_FORMS = ['charizard-mega-x', 'charizard-mega-y', 'mewtwo-mega-x', 'mewtwo-mega-y']

//condiciones de nombres
export const formatShowdownName = (pokemonName) => {
  // Deoxys formas
  if (pokemonName === 'deoxys-normal') return 'deoxys'

  // formas de urshifu
  if (pokemonName.startsWith('urshifu-')) {
    return pokemonName.replace('-single-strike', '').replace('-rapid-strike', '-rapidstrike')
  }

  // Formas Incarnate de los genios
  if (pokemonName.endsWith('-incarnate')) {
    return pokemonName.replace('-incarnate', '')
  }

  // Oricorio formas
  if (pokemonName === 'oricorio-pom-pom') return 'oricorio-pompom'
  if (pokemonName === 'oricorio-baile') return 'oricorio'
  

  // formas de pikachu revisar en sprites y condiciones
  // casos especiales
  if (pokemonName === 'pikachu-rock-star') return 'pikachu-rockstar'
  if (pokemonName === 'pikachu-pop-star') return 'pikachu-popstar'

  // quitar -cap
  if (pokemonName.startsWith('pikachu-') && pokemonName.endsWith('-cap')) {
    return pokemonName.replace('-cap', '')
  }

  // condiciones para necrozma, buscar ajustes para esto
  if (pokemonName === 'necrozma-dawn') return 'necrozma-dawnwings'
  if (pokemonName === 'necrozma-dusk') return 'necrozma-duskmane'

  // pokes con sprites segun su sexo
  if (pokemonName === 'indeedee-male') return 'indeedee'
  if (pokemonName === 'indeedee-female') return 'indeedee-f'
  if (pokemonName === 'pyroar-male') return 'pyroar'

  //keldeo y ogerpon
  if (pokemonName === 'keldeo-ordinary') return 'keldeo'
  if (pokemonName.startsWith('ogerpon-') && pokemonName.includes('-mask')) {
    return pokemonName.replace('-mask', '')
  }

  // condicion para los del futuro
  if (pokemonName.startsWith('iron-')) {
    return pokemonName.replace('iron-', 'iron').replace('-', '')
  }

  // condiciones para tauros
  if (pokemonName.startsWith('tauros-paldea-')) {
    const parts = pokemonName.split('-')
    // ['tauros', 'paldea', 'blaze', 'breed']
    return parts[0] + '-' + parts[1] + parts[2]
  }
  // Casos especiales para mega con dos formas
  if (DUAL_MEGA_FORMS.includes(pokemonName)) {
    return pokemonName.replace('-mega-', '-mega')
  }

  // Pokes con una mega consrevar el nombre original con guion
  if (pokemonName.endsWith('-mega')) {
    return pokemonName // Retorna "venusaur-mega" tal cual
  }

  // Para otros Pokémon, mantener el nombre original
  return pokemonName
}

export const shouldUseShowdown = (pokemonName) => {
  // Cherrim sunshine siempre usa Showdown
  if (pokemonName === 'cherrim-sunshine') return true

  // Todos los mega Pokémon con una sola forma (-mega) usan Showdown
  if (pokemonName.endsWith('-mega')) return true

  // Los mega con dos formas (mega-x, mega-y) usan Showdown
  if (DUAL_MEGA_FORMS.includes(pokemonName)) return true

  // Excluir mega evoluciones
  if (
    pokemonName.includes('mega') &&
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

// En showdownSprites.js - Agrega esta nueva función:

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

  // También preparamos los fallback de Gen5
  const gen5Sprites = {
    front_default: `${baseUrl}/home/${showdownName}.png`,
    front_shiny: `${baseUrl}/home-shiny/${showdownName}.png`,
    back_default: `${baseUrl}/home/${showdownName}.png`,
    back_shiny: `${baseUrl}/home-shiny/${showdownName}.png`,
  }

  // Devolvemos ambos y manejamos el error en el componente
  return {
    animated: animatedSprites,
    fallback: gen5Sprites,
  }
}
