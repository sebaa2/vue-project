// helpers/getMoves.js (versión con caché)
import { getSpanishName } from '../helpers/getNombresES.js'
import { useMoveCacheStore } from '../stores/moveStore.js'

export const getMoves = async (moves) => {
  if (!moves || moves.length === 0) return []

  const moveCache = useMoveCacheStore()

  // Extraer URLs de movimientos y construir mapa de metadatos de aprendizaje
  const moveUrls = moves.map((move) => move.move.url)

  // Mapa URL → { levelLearnedAt, learnMethod } usando el grupo de versión más reciente
  const learnMetaMap = {}
  moves.forEach((m) => {
    const details = m.version_group_details[m.version_group_details.length - 1]
    learnMetaMap[m.move.url] = {
      levelLearnedAt: details?.level_learned_at ?? null,
      learnMethod: details?.move_learn_method?.name ?? null,
    }
  })

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
        accuracy: moveData.accuracy,
        priority: moveData.priority,
        originalName: moveData.name,
      }

      // Guardar en caché (sin metadatos de aprendizaje, que son por Pokémon)
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
          originalName: '',
        },
      }
    }
  })

  // Esperar a que se carguen todos los movimientos faltantes
  const loadedMoves = await Promise.all(movesPromises)

  // Combinar todos los movimientos
  const allMoves = {}

  Object.entries(cachedMoves).forEach(([url, data]) => {
    allMoves[url] = data
  })

  loadedMoves.forEach(({ url, data }) => {
    allMoves[url] = data
  })

  // Retornar en el orden original, inyectando metadatos de aprendizaje (específicos por Pokémon)
  return moveUrls.map((url) => ({
    ...allMoves[url],
    levelLearnedAt: learnMetaMap[url]?.levelLearnedAt ?? null,
    learnMethod: learnMetaMap[url]?.learnMethod ?? null,
  }))
}