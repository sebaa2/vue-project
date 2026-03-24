// composables/usePokemonImages.js
import { ref } from 'vue'
import notFound from '../assets/images/noFound.png'

export function usePokemonImages() {
  
  // Cache de imágenes cargadas
  const imageCache = ref(new Map())
  const loadingImages = ref(new Map())
  
  // Pre-cargar imagen
  const preloadImage = (src) => {
    if (!src || imageCache.value.has(src)) return Promise.resolve(src)
    
    if (loadingImages.value.has(src)) {
      return loadingImages.value.get(src)
    }
    
    const promise = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        imageCache.value.set(src, true)
        loadingImages.value.delete(src)
        resolve(src)
      }
      img.onerror = () => {
        loadingImages.value.delete(src)
        reject(new Error(`Failed to load image: ${src}`))
      }
      img.src = src
    })
    
    loadingImages.value.set(src, promise)
    return promise
  }
  
  // Obtener imagen con prioridades y fallbacks
  const getPokemonImage = async (pokemon, priority = 'medium') => {
    if (!pokemon) return notFound
    
    const imageSources = {
      high: [
        pokemon.image,
        pokemon.sprites?.other?.['official-artwork']?.front_default,
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
      ],
      medium: [
        pokemon.sprites?.front_default,
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
      ],
      low: [
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
      ]
    }
    
    const sources = imageSources[priority] || imageSources.medium
    
    for (const src of sources) {
      if (src && src !== notFound) {
        try {
          await preloadImage(src)
          return src
        } catch (error) {
          console.warn(`Failed to load ${src}, trying next source`)
        }
      }
    }
    
    return notFound
  }
  
  // Versión síncrona para uso inmediato
  const getPokemonImageSync = (pokemon) => {
    if (!pokemon) return notFound
    
    return pokemon.image ||
           pokemon.sprites?.other?.['official-artwork']?.front_default ||
           `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png` ||
           notFound
  }
  
  // Manejador de error con reintentos
  const handleImageError = (event, pokemon, retryCount = 0) => {
    const img = event.target
    const maxRetries = 2
    
    if (retryCount >= maxRetries) {
      img.src = notFound
      img.classList.add('image-error')
      return
    }
    
    // Intentar con sprite normal si falló el oficial
    if (img.src.includes('official-artwork')) {
      img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`
      
      // Reintentar con manejo de error
      img.onerror = (e) => handleImageError(e, pokemon, retryCount + 1)
    } else {
      img.src = notFound
      img.classList.add('image-error')
    }
  }
  
  return {
    getPokemonImage,
    getPokemonImageSync,
    handleImageError,
    preloadImage
  }
}