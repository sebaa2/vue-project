import { ref } from 'vue'

export function usePokemonLoading() {
  const localLoading = ref(true)
  const loadProgress = ref(0)

  const loadPokemonWithProgress = async (loadPokemonFn, pokemonId) => {
    localLoading.value = true
    loadProgress.value = 0

    const interval = setInterval(() => {
      if (loadProgress.value < 90) {
        const increment = loadProgress.value < 30 ? 15 : loadProgress.value < 60 ? 8 : 3
        loadProgress.value = Math.min(loadProgress.value + increment, 90)
      }
    }, 50)

    try {
      await loadPokemonFn(pokemonId)
      loadProgress.value = 100
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error('Error loading Pokémon:', error)
      loadProgress.value = 100
      await new Promise((resolve) => setTimeout(resolve, 200))
    } finally {
      clearInterval(interval)
      setTimeout(() => {
        localLoading.value = false
      }, 100)
    }
  }

  return { localLoading, loadProgress, loadPokemonWithProgress }
}
