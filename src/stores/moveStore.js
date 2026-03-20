
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMoveCacheStore = defineStore('moveCache', () => {
  // ==================== STATE ====================
  const cache = ref({})
  const cacheExpiry = ref(7 * 24 * 60 * 60 * 1000) // 7 días
  const maxCacheSize = ref(1000) // Máximo de movimientos en caché

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
  const setMove = (moveUrl, moveData) => {
    // Usar la URL como clave (es única para cada movimiento)
    const key = moveUrl
    
    // Limpiar caché si excede el tamaño máximo
    if (cacheSize.value >= maxCacheSize.value && !cache.value[key]) {
      removeOldestEntry()
    }
    
    cache.value[key] = {
      data: JSON.parse(JSON.stringify(moveData)), // Clonar para evitar mutaciones
      timestamp: Date.now(),
      url: moveUrl
    }
    
    if (import.meta.env.DEV) {
      console.log(`💾 Movimiento guardado en caché: ${moveData.name || moveUrl}`)
    }
  }

  const getMove = (moveUrl) => {
    const cached = cache.value[moveUrl]
    if (!cached) return null
    
    const now = Date.now()
    const isExpired = (now - cached.timestamp) > cacheExpiry.value
    
    if (isExpired) {
      if (import.meta.env.DEV) {
        console.log(`⏰ Movimiento expirado en caché: ${moveUrl}`)
      }
      removeMove(moveUrl)
      return null
    }
    
    if (import.meta.env.DEV) {
      console.log(`✅ Movimiento obtenido de caché: ${cached.data.name}`)
    }
    return JSON.parse(JSON.stringify(cached.data)) // Devolver copia
  }

  const hasMove = (moveUrl) => {
    const cached = cache.value[moveUrl]
    if (!cached) return false
    
    const isExpired = (Date.now() - cached.timestamp) > cacheExpiry.value
    return !isExpired
  }

  const removeMove = (moveUrl) => {
    if (cache.value[moveUrl]) {
      delete cache.value[moveUrl]
      if (import.meta.env.DEV) {
        console.log(`🗑️ Movimiento eliminado de caché: ${moveUrl}`)
      }
    }
  }

  const removeOldestEntry = () => {
    let oldestUrl = null
    let oldestTimestamp = Infinity
    
    Object.entries(cache.value).forEach(([url, item]) => {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp
        oldestUrl = url
      }
    })
    
    if (oldestUrl) {
      removeMove(oldestUrl)
      if (import.meta.env.DEV) {
        console.log(`🔄 Caché de movimientos llena, eliminando: ${oldestUrl}`)
      }
    }
  }

  const clearCache = () => {
    cache.value = {}
    console.log('🧹 Caché de movimientos completamente limpiado')
  }

  const clearExpiredCache = () => {
    const now = Date.now()
    let removedCount = 0
    
    Object.keys(cache.value).forEach(url => {
      if (now - cache.value[url].timestamp > cacheExpiry.value) {
        removeMove(url)
        removedCount++
      }
    })
    
    if (removedCount > 0 && import.meta.env.DEV) {
      console.log(`🧹 Eliminados ${removedCount} movimientos expirados de caché`)
    }
  }

  const getMovesBatch = (moveUrls) => {
    const result = {}
    const missingMoves = []
    
    moveUrls.forEach(url => {
      const cached = getMove(url)
      if (cached) {
        result[url] = cached
      } else {
        missingMoves.push(url)
      }
    })
    
    return { result, missingMoves }
  }

  return {
    cache,
    cacheExpiry,
    maxCacheSize,
    cacheSize,
    cacheStats,
    setMove,
    getMove,
    hasMove,
    removeMove,
    clearCache,
    clearExpiredCache,
    getMovesBatch,
  }
}, {
  persist: {
    key: 'move-cache',
    storage: localStorage,
    paths: ['cache', 'cacheExpiry', 'maxCacheSize'],
  }
})