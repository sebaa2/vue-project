import { getSpanishName } from '../helpers/getNombresES.js'

export const getMoves = async (moves) => {
  const movesDetailsPromises = moves.map(async (move) => {
    const moveResponse = await fetch(move.move.url)
    const moveData = await moveResponse.json()
    //nobody expects the spanish inquistion, pero la traemos igual
    const spanishName = getSpanishName(moveData.names) || moveData.name

    return {
      type: moveData.type.name,
      category: moveData.damage_class.name,
      name: spanishName,
      power: moveData.power || '-',
      pp: moveData.pp,
    }
  })
  return await Promise.all(movesDetailsPromises)
}
