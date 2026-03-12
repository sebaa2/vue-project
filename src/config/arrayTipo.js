export function formatTipos(type) {
  if (!type) return { color: 'bg-gray-500', tipo: 'Normal' }

  const tipoStr = typeof type === 'string' ? type : type.type

  const tipos = {
    grass: { color: 'bg-green-500', tipo: 'Planta' },
    fire: { color: 'bg-red-500', tipo: 'Fuego' },
    water: { color: 'bg-blue-500', tipo: 'Agua' },
    bug: { color: 'bg-green-700', tipo: 'Bicho' },
    normal: { color: 'bg-gray-500', tipo: 'Normal' },
    poison: { color: 'bg-purple-500', tipo: 'Veneno' },
    electric: { color: 'bg-yellow-500', tipo: 'Eléctrico' },
    ground: { color: 'bg-yellow-700', tipo: 'Tierra' },
    fairy: { color: 'bg-pink-500', tipo: 'Hada' },
    fighting: { color: 'bg-red-700', tipo: 'Lucha' },
    psychic: { color: 'bg-purple-700', tipo: 'Psíquico' },
    rock: { color: 'bg-gray-700', tipo: 'Roca' },
    ghost: { color: 'bg-gray-900', tipo: 'Fantasma' },
    ice: { color: 'bg-blue-300', tipo: 'Hielo' },
    dragon: { color: 'bg-purple-900', tipo: 'Dragón' },
    steel: { color: 'bg-gray-400', tipo: 'Acero' },
    flying: { color: 'bg-blue-700', tipo: 'Volador' },
    dark: { color: 'bg-gray-800', tipo: 'Siniestro' }
  }

  return tipos[tipoStr] || { color: 'bg-gray-500', tipo: tipoStr }
}
