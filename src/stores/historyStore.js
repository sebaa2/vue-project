// stores/historyStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useHistoryStore = defineStore(
  'history',
  () => {
    // ==================== STATE ====================
    const visits = ref([])

    // ==================== GETTERS ====================

    // Pokémon más visitado
    const mostVisitedPokemon = computed(() => {
      if (visits.value.length === 0) return null

      const visitCount = {}
      visits.value.forEach((visit) => {
        if (!visitCount[visit.id]) {
          visitCount[visit.id] = {
            id: visit.id,
            name: visit.name,
            sprite: visit.sprite,
            count: 0,
          }
        }
        visitCount[visit.id].count++
      })

      let mostVisited = null
      let maxCount = 0

      for (const id in visitCount) {
        if (visitCount[id].count > maxCount) {
          maxCount = visitCount[id].count
          mostVisited = visitCount[id]
        }
      }

      return mostVisited
    })

    // Top 5 Pokémon más visitados
    const topVisitedPokemon = computed(() => {
      if (visits.value.length === 0) return []

      const visitCount = {}
      visits.value.forEach((visit) => {
        if (!visitCount[visit.id]) {
          visitCount[visit.id] = {
            id: visit.id,
            name: visit.name,
            sprite: visit.sprite,
            count: 0,
          }
        }
        visitCount[visit.id].count++
      })

      return Object.values(visitCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    })

    // Total de visitas
    const totalVisits = computed(() => visits.value.length)

    // Pokémon distintos visitados
    const uniquePokemonVisited = computed(() => {
      const uniqueIds = new Set(visits.value.map((v) => v.id))
      return uniqueIds.size
    })

    // Últimas 5 visitas
    const recentVisits = computed(() => {
      return [...visits.value].reverse().slice(0, 5)
    })

    // ==================== ACTIONS ====================

    const addVisit = (pokemon) => {
      if (!pokemon || !pokemon.id) return

      visits.value.push({
        id: pokemon.id,
        name: pokemon.name,
        timestamp: Date.now(),
        sprite:
          pokemon.sprites?.front_default ||
          pokemon.sprites?.other?.['official-artwork']?.front_default ||
          '',
      })

      if (visits.value.length > 200) {
        visits.value = visits.value.slice(-200)
      }

      console.log(`📊 Visita registrada: ${pokemon.name}`)
    }

    const clearHistory = () => {
      visits.value = []
      console.log('📊 Historial limpiado')
    }

    const cleanOldVisits = () => {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      const oldCount = visits.value.filter((v) => v.timestamp < thirtyDaysAgo).length

      visits.value = visits.value.filter((v) => v.timestamp >= thirtyDaysAgo)

      if (oldCount > 0) {
        console.log(`📊 Eliminadas ${oldCount} visitas antiguas`)
      }
    }

    return {
      // State
      visits,

      // Getters
      mostVisitedPokemon,
      topVisitedPokemon,
      totalVisits,
      uniquePokemonVisited,
      recentVisits,

      // Actions
      addVisit,
      clearHistory,
      cleanOldVisits,
    }
  },
  {
    persist: {
      key: 'pokedex-history',
      storage: localStorage,
      paths: ['visits'],
    },
  },
)
