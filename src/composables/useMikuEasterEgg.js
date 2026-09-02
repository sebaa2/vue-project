import { onUnmounted } from 'vue'

export function useMikuEasterEgg(pokemonRef, easterEggStore, MIKU_POKEMON_IDS) {
  let cleanupMiku = null

  const setupMikuEasterEgg = () => {
    const shouldBeActive = pokemonRef.value && MIKU_POKEMON_IDS.includes(pokemonRef.value.id)

    if (shouldBeActive && !cleanupMiku) {
      const buffer = []
      const SECRET_WORD = 'miku'

      const handleKeyDown = (event) => {
        const active = document.activeElement
        if (
          active &&
          (active.tagName?.toLowerCase() === 'input' ||
            active.tagName?.toLowerCase() === 'textarea' ||
            active.isContentEditable)
        ) {
          return
        }

        if (event.key.length !== 1 || !event.key.match(/[a-zA-Z]/)) {
          if (event.key === 'Escape' || event.key === 'Enter') buffer.length = 0
          return
        }

        buffer.push(event.key.toLowerCase())
        while (buffer.length > SECRET_WORD.length) buffer.shift()

        if (buffer.join('') === SECRET_WORD) {
          buffer.length = 0
          easterEggStore.triggerMiku()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      cleanupMiku = () => window.removeEventListener('keydown', handleKeyDown)
    } else if (!shouldBeActive && cleanupMiku) {
      cleanupMiku()
      cleanupMiku = null
    }
  }

  onUnmounted(() => {
    cleanupMiku?.()
  })

  return { setupMikuEasterEgg }
}
