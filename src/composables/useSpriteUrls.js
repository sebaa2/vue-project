import { computed } from 'vue'
import notFound from '../assets/images/noFound.png'

const MEGA_SPECIAL_IDS = {
  'raichu-mega-x': 10304,
  'raichu-mega-y': 10305,
  'absol-mega-z': 10307,
  'lucario-mega-z': 10310,
}

export function useSpriteUrls(pokemonRef, isShinyRef) {
  const getArtworkId = (pokemon) => MEGA_SPECIAL_IDS[pokemon.name] ?? pokemon.id

  const getOfficialArtworkUrl = (pokemon, shiny = false) => {
    const artworkId = getArtworkId(pokemon)
    if (!artworkId) return null
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shiny ? 'shiny/' : ''}${artworkId}.png`
  }

  const getBasicSpriteUrl = (pokemon, shiny = false, back = false) => {
    const artworkId = getArtworkId(pokemon)
    if (!artworkId) return null
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${back ? 'back/' : ''}${shiny ? 'shiny/' : ''}${artworkId}.png`
  }

  const getSpriteUrl = (type, shiny = false) => {
    const pokemon = pokemonRef.value
    if (!pokemon) return notFound

    const showdownSprite = shiny
      ? pokemon.sprites?.[type === 'front' ? 'front_shiny' : 'back_shiny']
      : pokemon.sprites?.[type === 'front' ? 'front_default' : 'back_default']

    if (showdownSprite && !showdownSprite.includes('undefined')) return showdownSprite

    const officialUrl = getOfficialArtworkUrl(pokemon, shiny)
    if (officialUrl) return officialUrl

    const basicUrl = getBasicSpriteUrl(pokemon, shiny, type === 'back')
    return basicUrl || notFound
  }

  const handleImageError = (event, type) => {
    const img = event.target
    const pokemon = pokemonRef.value

    if (!pokemon || img.src === notFound) return

    let newUrl = null
    if (img.src.includes('showdown') || img.src.includes('play.pokemonshowdown')) {
      newUrl = getOfficialArtworkUrl(pokemon, isShinyRef.value)
    } else if (img.src.includes('official-artwork')) {
      newUrl = getBasicSpriteUrl(pokemon, isShinyRef.value, type === 'back')
    }

    if (newUrl) {
      img.src = newUrl
      return
    }

    img.src = notFound
    img.classList.add('image-error')
  }

  return {
    frontSpriteUrl: computed(() => getSpriteUrl('front', isShinyRef.value)),
    backSpriteUrl: computed(() => getSpriteUrl('back', isShinyRef.value)),
    handleImageError,
  }
}
