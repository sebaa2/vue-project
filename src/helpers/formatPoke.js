// formatPokemon.js

// Lista de Pokémon que siempre deben mostrarse completos
export const fullNames = [
  // Originales
  'ho-oh',
  'tapu-koko',
  'tapu-lele',
  'tapu-bulu',
  'tapu-fini',
  'type-null',
  'wo-chien',
  'chien-pao',
  'ting-lu',
  'chi-yu',

  // Nuevos casos - Formas regionales
  'mr-mime',
  'mr-rime',
  'mime-jr',
  'porygon-z',
  'jangmo-o',
  'hakamo-o',
  'kommo-o',

  // Pokémon con guiones en su nombre oficial
  'ho-oh',
  'porygon-z',
  'mime-jr',
  'mr-mime',
  'mr-rime',

  // Formas regionales de Galar
  'zigzagoon-galar',
  'linoone-galar',
  'obstagoon',
  'corsola-galar',
  'cursola',
  'farfetchd-galar',
  'sirfetchd',
  'darumaka-galar',
  'darmanitan-galar',
  'darmanitan-galar-zen',
  'yamask-galar',
  'runerigus',
  'stunfisk-galar',
  'slowpoke-galar',
  'slowbro-galar',
  'slowking-galar',

  // Formas de Hisui
  'growlithe-hisui',
  'arcanine-hisui',
  'voltorb-hisui',
  'electrode-hisui',
  'typhlosion-hisui',
  'qwilfish-hisui',
  'overqwil',
  'sneasel-hisui',
  'sneasler',
  'samurott-hisui',
  'lilligant-hisui',
  'zorua-hisui',
  'zoroark-hisui',
  'braviary-hisui',
  'sliggoo-hisui',
  'goodra-hisui',
  'avalugg-hisui',
  'decidueye-hisui',

  // Formas de Paldea
  'tauros-paldea-combat',
  'tauros-paldea-blaze',
  'tauros-paldea-aqua',
  'wooper-paldea',
  'clodsire',

  // Mega evoluciones que requieren formato especial
  'mewtwo-mega-x',
  'mewtwo-mega-y',
  'charizard-mega-x',
  'charizard-mega-y',
  'blastoise-mega',
  'venusaur-mega',
  'alakazam-mega',
  'gengar-mega',
  'kangaskhan-mega',
  'pinsir-mega',
  'gyarados-mega',
  'aerodactyl-mega',
  'ampharos-mega',
  'scizor-mega',
  'heracross-mega',
  'houndoom-mega',
  'tyranitar-mega',
  'blaziken-mega',
  'gardevoir-mega',
  'mawile-mega',
  'aggron-mega',
  'medicham-mega',
  'manectric-mega',
  'banette-mega',
  'absol-mega',
  'latios-mega',
  'latias-mega',
  'sceptile-mega',
  'swampert-mega',
  'sableye-mega',
  'sharpedo-mega',
  'camerupt-mega',
  'altaria-mega',
  'glalie-mega',
  'salamence-mega',
  'metagross-mega',
  'rayquaza-mega',
  'lopunny-mega',
  'garchomp-mega',
  'lucario-mega',
  'abomasnow-mega',
  'gallade-mega',
  'audino-mega',
  'diancie-mega',

  // Formas especiales
  'pikachu-rock-star',
  'pikachu-belle',
  'pikachu-pop-star',
  'pikachu-phd',
  'pikachu-libre',
  'pikachu-cosplay',
  'pikachu-original-cap',
  'pikachu-hoenn-cap',
  'pikachu-sinnoh-cap',
  'pikachu-unova-cap',
  'pikachu-kalos-cap',
  'pikachu-alola-cap',
  'pikachu-partner-cap',
  'pikachu-world-cap',
  'eevee-partner',
  'unown-a',
  'unown-b',
  'unown-c',
  'unown-d',
  'unown-e',
  'unown-f',
  'unown-g',
  'unown-h',
  'unown-i',
  'unown-j',
  'unown-k',
  'unown-l',
  'unown-m',
  'unown-n',
  'unown-o',
  'unown-p',
  'unown-q',
  'unown-r',
  'unown-s',
  'unown-t',
  'unown-u',
  'unown-v',
  'unown-w',
  'unown-x',
  'unown-y',
  'unown-z',
  'unown-exclamation',
  'unown-question',
  'minior-red',
  'minior-orange',
  'minior-yellow',
  'minior-green',
  'minior-blue',
  'minior-indigo',
  'minior-violet',

  // Fusión de Necrozma
  'necrozma-dusk',
  'necrozma-dawn',
  'necrozma-ultra',

  // Formas de Kyurem
  'kyurem-white',
  'kyurem-black',

  // Formas de Oricorio
  'oricorio-baile',
  'oricorio-pau',
  'oricorio-sensu',
  'oricorio-pom-pom',

  // Formas de Alcremie
  'alcremie-vanilla-cream',
  'alcremie-ruby-cream',
  'alcremie-matcha-cream',
  'alcremie-mint-cream',
  'alcremie-lemon-cream',
  'alcremie-salted-cream',
  'alcremie-ruby-swirl',
  'alcremie-caramel-swirl',
  'alcremie-rainbow-swirl',

  // Paradox adicionales
  'walking-wake',
  'iron-leaves',
  'gouging-fire',
  'raging-bolt',
  'iron-boulder',
  'iron-crown',
]

// Lista de paradoja Pokémon (mantener actualizada)
export const paradoxPokemon = [
  'great-tusk',
  'scream-tail',
  'brute-bonnet',
  'flutter-mane',
  'slither-wing',
  'sandy-shocks',
  'roaring-moon',
  'walking-wake',
  'gouging-fire',
  'raging-bolt',
  'iron-treads',
  'iron-bundle',
  'iron-hands',
  'iron-jugulis',
  'iron-moth',
  'iron-thorns',
  'iron-valiant',
  'iron-leaves',
  'iron-boulder',
  'iron-crown',
]

export const hyphenPokemon = [
  'ho-oh',
  'tapu-koko',
  'tapu-lele',
  'tapu-bulu',
  'tapu-fini',
  'type-null',
  'wo-chien',
  'chien-pao',
  'ting-lu',
  'chi-yu',
  'jangmo-o',
  'hakamo-o',
  'kommo-o',
  'mr-mime',
  'mr-rime',
  'mime-jr',
  'porygon-z'
]


// Función que devuelve si es paradoja
export function isParadoja(name) {
  return paradoxPokemon.includes(name)
}

// Función mejorada para detectar formas especiales
export function isSpecialForm(name) {
  const specialIndicators = [
    'mega',
    'galar',
    'hisui',
    'paldea',
    'alola',
    'cap',
    'partner',
    'rock-star',
    'belle',
    'pop-star',
    'phd',
    'libre',
    'cosplay',
    'dusk',
    'dawn',
    'ultra',
    'white',
    'black',
    'baile',
    'pau',
    'sensu',
    'pom-pom',
    'vanilla',
    'ruby',
    'matcha',
    'mint',
    'lemon',
    'salted',
    'swirl',
    '-o', // Para casos como jangmo-o
    '-jr', // Para casos como mime-jr
  ]

  return (
    specialIndicators.some((indicator) => name.includes(indicator)) ||
    fullNames.includes(name) ||
    paradoxPokemon.includes(name)
  )
}

export function formatPoke(name) {
  if (!name) return ''

  // Si es un Pokémon especial, mostrar nombre completo
  if (isSpecialForm(name) || fullNames.includes(name) || isParadoja(name)) {
    return name
      .split('-')
      .map((word, index) => {
        // Manejar casos especiales como "mega-x" o "galar-zen"
        if (word === 'mega' && index > 0) {
          return 'Mega'
        }
        if (word === 'x' || word === 'y') {
          return word.toUpperCase()
        }
        if (word === 'jr') {
          return 'Jr.'
        }
        // Capitalizar primera letra
        return word.charAt(0).toUpperCase() + word.slice(1)
      })
      .join(' ')
  }

  // Para el resto de Pokémon, solo tomar la primera parte
  const baseName = name.split('-')[0]
  return baseName.charAt(0).toUpperCase() + baseName.slice(1)
}

// Función adicional para debugging o uso específico
export function getPokemonForm(name) {
  if (!name) return { base: '', form: null }

  const parts = name.split('-')
  if (parts.length === 1) {
    return { base: parts[0], form: null }
  }

  return {
    base: parts[0],
    form: parts.slice(1).join('-'),
  }
}
