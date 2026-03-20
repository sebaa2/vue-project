// stores/pokemonCacheStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePokemonCacheStore = defineStore(
  'pokemonCache',
  () => {
    // Usar objetos en lugar de Map para persistencia
    const pokemonCache = ref({}) // { id: pokemonData }
    const metadataCache = ref({}) // { key: value }
    const maxCacheSize = 100

    const getPokemon = (id) => {
      return pokemonCache.value[id]
    }

    const setPokemon = (id, data) => {
      const currentSize = Object.keys(pokemonCache.value).length

      if (currentSize >= maxCacheSize) {
        const firstKey = Object.keys(pokemonCache.value)[0]
        delete pokemonCache.value[firstKey]
        console.log(`🗑️ Caché lleno, eliminando Pokémon ${firstKey}`)
      }

      pokemonCache.value[id] = data
    }

    const hasPokemon = (id) => {
      return !!pokemonCache.value[id]
    }

    const removePokemon = (id) => {
      delete pokemonCache.value[id]
    }

    const getMetadata = (key) => {
      return metadataCache.value[key]
    }

    const setMetadata = (key, value) => {
      metadataCache.value[key] = value
    }

    const removeMetadata = (key) => {
      delete metadataCache.value[key]
    }

    const clearCache = () => {
      pokemonCache.value = {}
      metadataCache.value = {}
      console.log('🗑️ Caché completamente limpiado')
    }

    return {
      pokemonCache,
      metadataCache,
      getPokemon,
      setPokemon,
      hasPokemon,
      removePokemon,
      getMetadata,
      setMetadata,
      removeMetadata,
      clearCache,
    }
  },
  {
    persist: {
      key: 'pokemon-cache',
      storage: localStorage,
      paths: ['pokemonCache', 'metadataCache'],
    },
  },
)
