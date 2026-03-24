// composables/usePokemonUtils.js
import { formatTipos, getTipoEnEspanol } from '../config/arrayTipo.js'
import notFound from '../assets/images/noFound.png'

export function usePokemonUtils() {
  
  // Formatear nombre de Pokémon
  const formatPokemonName = (name) => {
    if (!name) return ''
    return name.split('-')[0]
      .charAt(0)
      .toUpperCase() + 
      name.split('-')[0]
      .slice(1)
  }
  
  // Formatear tipo a español
  const formatTipo = (tipo) => {
    return getTipoEnEspanol(tipo)
  }
  
  // Obtener color del tipo
  const getTypeColor = (type) => {
    const formatted = formatTipos(type)
    return formatted?.color || 'bg-gray-500'
  }
  
  // Obtener imagen del Pokémon con fallbacks
  const getPokemonImage = (pokemon) => {
    if (!pokemon) return notFound
    
    // Prioridad de imágenes
    const imageSources = [
      pokemon.image,
      pokemon.sprites?.other?.['official-artwork']?.front_default,
      pokemon.sprites?.front_default,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
    ]
    
    const validImage = imageSources.find(src => src && src !== notFound)
    return validImage || notFound
  }
  
  // Manejador de error de imágenes
  const handleImageError = (event, pokemonId) => {
    const img = event.target
    
    if (img.src === notFound) return
    
    console.warn(`Error cargando imagen para Pokémon ID: ${pokemonId}`)
    
    // Intentar con sprite normal si falló el oficial
    if (img.src.includes('official-artwork')) {
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
      
      // Si también falla, usar placeholder
      img.onerror = () => {
        img.src = notFound
        img.classList.add('image-error')
      }
    } else {
      img.src = notFound
      img.classList.add('image-error')
    }
  }
  
  // Verificar si es Mega Pokémon
  const isMegaPokemon = (name) => {
    if (!name) return false
    
    const lowerName = name.toLowerCase()
    
    if (!lowerName.includes('mega')) return false
    
    // Excepciones que contienen "mega" pero no son mega evoluciones
    const exceptions = ['meganium', 'yanmega']
    if (exceptions.includes(lowerName)) return false
    
    return lowerName.includes('-mega')
  }
  
  return {
    formatPokemonName,
    formatTipo,
    getTypeColor,
    getPokemonImage,
    handleImageError,
    isMegaPokemon
  }
}