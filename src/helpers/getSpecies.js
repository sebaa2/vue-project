export const getSpecies = async (id) => {
  const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  const speciesData = await resSpecies.json()

  let varieties = [...speciesData.varieties]

  // Función para corregir URLs problemáticas
  const fixVarietyUrl = (variety) => {
    const urlParts = variety.pokemon.url.split('/').filter(Boolean)
    const lastPart = urlParts[urlParts.length - 1]
    
    // Si la última parte no es un número (ID) y contiene números además del nombre
    if (isNaN(parseInt(lastPart)) && /\d/.test(lastPart)) {
      // Extraer solo la parte alfabética del nombre
      const cleanName = lastPart.replace(/\d+$/, '')
      
      console.warn(`URL potencialmente inválida detectada: ${variety.pokemon.url}`)
      console.warn(`Corrigiendo a: ${cleanName}`)
      
      // Corregir la URL si el nombre limpio es válido
      if (cleanName && cleanName !== lastPart) {
        variety.pokemon.url = `https://pokeapi.co/api/v2/pokemon/${cleanName}`
        variety.pokemon.name = cleanName
      }
    }
    
    return variety
  }

  // Corregir URLs problemáticas
  varieties = varieties.map(fixVarietyUrl)

  // Manejo especial para Cherrim
  if (Number(id) === 421) {
    // Evitar duplicados
    const hasSunshine = varieties.some(v => v.pokemon.name === 'cherrim-sunshine')
    if (!hasSunshine) {
      varieties.push({
        is_default: false,
        pokemon: {
          name: "cherrim-sunshine",
          url: "https://pokeapi.co/api/v2/pokemon/cherrim-sunshine"
        }
      })
    }
  }

  // Manejo especial para Falinks (ID 870)
  if (Number(id) === 870) {
    // Filtrar variedades inválidas
    varieties = varieties.filter(variety => {
      const urlParts = variety.pokemon.url.split('/').filter(Boolean)
      const lastPart = urlParts[urlParts.length - 1]
      // Solo mantener URLs válidas (falinks sin números)
      if (lastPart !== 'falinks' && lastPart.startsWith('falinks') && lastPart !== 'falinks') {
        console.warn(`Filtrando variedad inválida para Falinks: ${lastPart}`)
        return false
      }
      return true
    })
  }

  return varieties
}