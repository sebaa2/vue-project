// stores/pokemonCacheStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePokemonCacheStore = defineStore('pokemonCache', () => {
  // ==================== STATE ====================
  const cache = ref({})
  const cacheExpiry = ref(30 * 60 * 1000) // 30 minutos en milisegundos
  const maxCacheSize = ref(50) // Máximo número de Pokémon en caché

  // ==================== GETTERS ====================
  const cacheSize = computed(() => Object.keys(cache.value).length)
  
  const cacheStats = computed(() => {
    const now = Date.now()
    let validCount = 0
    let expiredCount = 0
    
    Object.values(cache.value).forEach(item => {
      if (now - item.timestamp < cacheExpiry.value) {
        validCount++
      } else {
        expiredCount++
      }
    })
    
    return { validCount, expiredCount, total: cacheSize.value }
  })

  // ==================== ACTIONS ====================
  const setPokemon = (id, data) => {
    // Limpiar caché si excede el tamaño máximo
    if (cacheSize.value >= maxCacheSize.value && !cache.value[id]) {
      removeOldestEntry()
    }
    
    cache.value[id] = {
      data: JSON.parse(JSON.stringify(data)), // Clonar para evitar mutaciones
      timestamp: Date.now(),
      id: id
    }
    
    console.log(`💾 Pokémon ${id} guardado en caché`)
  }

  const getPokemon = (id) => {
    const cached = cache.value[id]
    if (!cached) return null
    
    const now = Date.now()
    const isExpired = (now - cached.timestamp) > cacheExpiry.value
    
    if (isExpired) {
      console.log(`⏰ Pokémon ${id} expirado en caché`)
      removePokemon(id)
      return null
    }
    
    console.log(`✅ Pokémon ${id} obtenido de caché (${Math.round((now - cached.timestamp) / 1000)}s de antigüedad)`)
    return JSON.parse(JSON.stringify(cached.data)) // Devolver copia para evitar mutaciones
  }

  const hasPokemon = (id) => {
    const cached = cache.value[id]
    if (!cached) return false
    
    const isExpired = (Date.now() - cached.timestamp) > cacheExpiry.value
    return !isExpired
  }

  const removePokemon = (id) => {
    if (cache.value[id]) {
      delete cache.value[id]
      console.log(`🗑️ Pokémon ${id} eliminado de caché`)
    }
  }

  const removeOldestEntry = () => {
    let oldestId = null
    let oldestTimestamp = Infinity
    
    Object.entries(cache.value).forEach(([id, item]) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
        oldestId = id
      }
    })
    
    if (oldestId) {
      removePokemon(oldestId)
      console.log(`🔄 Caché llena, eliminando entrada más antigua: ${oldestId}`)
    }
  }

  const clearCache = () => {
    cache.value = {}
    console.log('🧹 Caché completamente limpiado')
  }

  const clearExpiredCache = () => {
    const now = Date.now()
    let removedCount = 0
    
    Object.keys(cache.value).forEach(id => {
      if (now - cache.value[id].timestamp > cacheExpiry.value) {
        removePokemon(id)
        removedCount++
      }
    })
    
    console.log(`🧹 Eliminados ${removedCount} Pokémon expirados de caché`)
  }

  const setCacheExpiry = (minutes) => {
    cacheExpiry.value = minutes * 60 * 1000
    console.log(`⏱️ Tiempo de expiración de caché cambiado a ${minutes} minutos`)
    clearExpiredCache() // Limpiar entradas expiradas con la nueva configuración
  }

  const setMaxCacheSize = (size) => {
    maxCacheSize.value = size
    console.log(`📏 Tamaño máximo de caché cambiado a ${size}`)
    
    // Eliminar entradas más antiguas si excede el nuevo límite
    while (cacheSize.value > maxCacheSize.value) {
      removeOldestEntry()
    }
  }

  return {
    // state
    cache,
    cacheExpiry,
    maxCacheSize,
    // getters
    cacheSize,
    cacheStats,
    // actions
    setPokemon,
    getPokemon,
    hasPokemon,
    removePokemon,
    clearCache,
    clearExpiredCache,
    setCacheExpiry,
    setMaxCacheSize,
  }
}, {
  persist: {
    key: 'pokemon-cache',
    storage: localStorage,
    paths: ['cache', 'cacheExpiry', 'maxCacheSize'],
  }
})