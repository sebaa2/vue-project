export function formatTipos(type) {
  if (!type) return { color: 'bg-gray-500', tipo: 'Normal' }

  const tipoStr = typeof type === 'string' ? type : type.type

  if (tipoStr === 'grass') {
    return { color: 'bg-green-500', tipo: 'Planta' }
  } else if (tipoStr === 'fire') {
    return { color: 'bg-red-500', tipo: 'Fuego' }
  } else if (tipoStr === 'water') {
    return { color: 'bg-blue-500', tipo: 'Agua' }
  } else if (tipoStr === 'bug') {
    return { color: 'bg-green-700', tipo: 'Bicho' }
  } else if (tipoStr === 'normal') {
    return { color: 'bg-gray-500', tipo: 'Normal' }
  } else if (tipoStr === 'poison') {
    return { color: 'bg-purple-500', tipo: 'Veneno' }
  } else if (tipoStr === 'electric') {
    return { color: 'bg-yellow-500', tipo: 'Eléctrico' }
  } else if (tipoStr === 'ground') {
    return { color: 'bg-yellow-700', tipo: 'Tierra' }
  } else if (tipoStr === 'fairy') {
    return { color: 'bg-pink-500', tipo: 'Hada' }
  } else if (tipoStr === 'fighting') {
    return { color: 'bg-red-700', tipo: 'Lucha' }
  } else if (tipoStr === 'psychic') {
    return { color: 'bg-purple-700', tipo: 'Psíquico' }
  } else if (tipoStr === 'rock') {
    return { color: 'bg-gray-700', tipo: 'Roca' }
  } else if (tipoStr === 'ghost') {
    return { color: 'bg-gray-900', tipo: 'Fantasma' }
  } else if (tipoStr === 'ice') {
    return { color: 'bg-blue-300', tipo: 'Hielo' }
  } else if (tipoStr === 'dragon') {
    return { color: 'bg-purple-900', tipo: 'Dragón' }
  } else if (tipoStr === 'steel') {
    return { color: 'bg-gray-400', tipo: 'Acero' }
  } else if (tipoStr === 'flying') {
    return { color: 'bg-blue-700', tipo: 'Volador' }
  } else if (tipoStr === 'dark') {
    return { color: 'bg-gray-800', tipo: 'Siniestro' }
  } else {
    return { color: 'bg-gray-500', tipo: tipoStr }
  }
}
