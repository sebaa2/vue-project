// helpers/getMoves.js (versión con caché)
import { getSpanishName } from '../helpers/getNombresES.js'
import { useMoveCacheStore } from '../stores/moveStore.js'

export const getMoves = async (moves) => {
  if (!moves || moves.length === 0) return []

  const moveCache = useMoveCacheStore()

  // Extraer URLs de movimientos
  const moveUrls = moves.map((move) => move.move.url)

  // Verificar cuáles están en caché
  const { result: cachedMoves, missingMoves } = moveCache.getMovesBatch(moveUrls)

  // Cargar movimientos faltantes desde API
  const movesPromises = missingMoves.map(async (moveUrl) => {
    try {
      const moveResponse = await fetch(moveUrl)
      const moveData = await moveResponse.json()

      // Obtener nombre en español
      const spanishName = getSpanishName(moveData.names) || moveData.name

      const formattedMove = {
        type: moveData.type.name,
        category: moveData.damage_class.name,
        name: spanishName,
        power: moveData.power || '-',
        pp: moveData.pp,
        effect:
          moveData.effect_entries?.find((e) => e.language.name === 'es')?.effect ||
          moveData.effect_entries?.find((e) => e.language.name === 'en')?.effect ||
          'Sin descripción disponible',
        accuracy: moveData.accuracy, // Puede ser null para movimientos de estado
        priority: moveData.priority,
        originalName: moveData.name, // Guardar nombre original para referencia
      }

      // Guardar en caché
      moveCache.setMove(moveUrl, formattedMove)

      return { url: moveUrl, data: formattedMove }
    } catch (error) {
      console.error(`Error cargando movimiento desde ${moveUrl}:`, error)
      return {
        url: moveUrl,
        data: {
          type: 'normal',
          category: 'status',
          name: 'Error',
          power: '-',
          pp: 0,
          effect: 'Error cargando información del movimiento',
          accuracy: null,
          priority: 0,
        },
      }
    }
  })

  // Esperar a que se carguen todos los movimientos faltantes
  const loadedMoves = await Promise.all(movesPromises)

  // Combinar todos los movimientos
  const allMoves = {}

  // Agregar movimientos en caché
  Object.entries(cachedMoves).forEach(([url, data]) => {
    allMoves[url] = data
  })

  // Agregar movimientos recién cargados
  loadedMoves.forEach(({ url, data }) => {
    allMoves[url] = data
  })

  // Retornar en el orden original
  return moveUrls.map((url) => allMoves[url])
}
