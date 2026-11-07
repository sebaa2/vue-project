const cache = new Map()

export async function fetchCachedJson(source, url, ttlMs = 10 * 60 * 1000) {
  const cached = cache.get(url)
  if (cached?.value && cached.expiresAt > Date.now()) return cached.value
  if (cached?.promise) return cached.promise

  const promise = (async () => {
    let response
    try {
      response = await fetch(url)
    } catch (cause) {
      throw new CompetitiveSourceError(source, `No se pudo conectar con ${source}.`, {
        cause,
        url,
      })
    }

    if (!response.ok) {
      throw new CompetitiveSourceError(
        source,
        `${source} respondió con el estado HTTP ${response.status}.`,
        { status: response.status, url },
      )
    }

    try {
      return await response.json()
    } catch (cause) {
      throw new CompetitiveSourceError(source, `La respuesta de ${source} no es JSON válido.`, {
        cause,
        url,
      })
    }
  })()

  cache.set(url, { promise })

  try {
    const value = await promise
    cache.set(url, { value, expiresAt: Date.now() + ttlMs })
    return value
  } catch (error) {
    cache.delete(url)
    throw error
  }
}

export async function fetchCachedText(source, url, ttlMs = 10 * 60 * 1000) {
  const cached = cache.get(url)
  if (cached?.value && cached.expiresAt > Date.now()) return cached.value
  if (cached?.promise) return cached.promise

  const promise = (async () => {
    let response
    try {
      response = await fetch(url)
    } catch (cause) {
      throw new CompetitiveSourceError(source, `No se pudo conectar con ${source}.`, {
        cause,
        url,
      })
    }

    if (!response.ok) {
      throw new CompetitiveSourceError(
        source,
        `${source} respondió con el estado HTTP ${response.status}.`,
        { status: response.status, url },
      )
    }

    return response.text()
  })()

  cache.set(url, { promise })

  try {
    const value = await promise
    cache.set(url, { value, expiresAt: Date.now() + ttlMs })
    return value
  } catch (error) {
    cache.delete(url)
    throw error
  }
}

export class CompetitiveSourceError extends Error {
  constructor(source, message, { status, url, cause } = {}) {
    super(message, { cause })
    this.name = 'CompetitiveSourceError'
    this.source = source
    this.status = status
    this.url = url
  }
}
