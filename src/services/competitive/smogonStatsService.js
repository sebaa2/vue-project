import { CompetitiveSourceError, fetchCachedJson, fetchCachedText } from './cache.js'

const BASE_URL = 'https://www.smogon.com/stats'
const FORMAT_ID_PATTERN = /^[a-z0-9]+$/

function getMonthlyFolders(indexHtml) {
  return [...indexHtml.matchAll(/href="(\d{4}-\d{2})\/"/g)]
    .map((match) => match[1])
    .sort((left, right) => right.localeCompare(left))
}

export const smogonStatsService = {
  async getLatestFormatStats(formatId) {
    if (!FORMAT_ID_PATTERN.test(formatId)) {
      throw new Error(`Formato Smogon no válido: ${formatId}`)
    }

    const index = await fetchCachedText('Smogon Stats', `${BASE_URL}/`)
    const months = getMonthlyFolders(index).slice(0, 12)

    if (!months.length) {
      throw new CompetitiveSourceError(
        'Smogon Stats',
        'Smogon Stats no publicó directorios mensuales que se puedan consultar.',
      )
    }

    for (const month of months) {
      const url = `${BASE_URL}/${month}/chaos/${formatId}-1760.json`
      try {
        return {
          data: await fetchCachedJson('Smogon Stats', url),
          month,
        }
      } catch (error) {
        if (error.status === 404) continue
        throw error
      }
    }

    throw new CompetitiveSourceError(
      'Smogon Stats',
      `No hay estadísticas publicadas para ${formatId} en los últimos 12 meses.`,
    )
  },
}
