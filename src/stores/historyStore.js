// stores/historyStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHistoryStore = defineStore('history', () => {
  const visitedPokemon = ref([])

  const addVisit = (pokemon) => {
    if (!pokemon) return

    const visit = {
      id: pokemon.id,
      name: pokemon.name,
      timestamp: Date.now(),
      sprite: pokemon.sprites?.front_default,
    }

    // Evitar duplicados consecutivos
    const lastVisit = visitedPokemon.value[visitedPokemon.value.length - 1]
    if (lastVisit?.id !== visit.id) {
      visitedPokemon.value.push(visit)
      // Limitar historial a 50 elementos
      if (visitedPokemon.value.length > 50) {
        visitedPokemon.value.shift()
      }
    }
  }

  const clearHistory = () => {
    visitedPokemon.value = []
  }

  return {
    visitedPokemon,
    addVisit,
    clearHistory,
  }
})
