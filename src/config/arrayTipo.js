// config/arrayTipo.js
export function formatTipos(type) {
  if (!type) return { color: 'bg-gray-500', tipo: 'Normal' }

  const tipoStr = typeof type === 'string' ? type : type.type

  const tipos = {
    grass: { color: 'bg-green-400', tipo: 'Planta' },
    fire: { color: 'bg-orange-400', tipo: 'Fuego' },
    water: { color: 'bg-blue-400', tipo: 'Agua' },
    bug: { color: 'bg-lime-400', tipo: 'Bicho' },
    normal: { color: 'bg-gray-400', tipo: 'Normal' },
    poison: { color: 'bg-purple-500', tipo: 'Veneno' },
    electric: { color: 'bg-yellow-400', tipo: 'Eléctrico' },
    ground: { color: 'bg-yellow-700', tipo: 'Tierra' },
    fairy: { color: 'bg-pink-500', tipo: 'Hada' },
    fighting: { color: 'bg-red-800', tipo: 'Lucha' },
    psychic: { color: 'bg-purple-700', tipo: 'Psíquico' },
    rock: { color: 'bg-stone-500', tipo: 'Roca' },
    ghost: { color: 'bg-violet-700', tipo: 'Fantasma' },
    ice: { color: 'bg-blue-300', tipo: 'Hielo' },
    dragon: { color: 'bg-indigo-700', tipo: 'Dragón' },
    steel: { color: 'bg-slate-400', tipo: 'Acero' },
    flying: { color: 'bg-indigo-400', tipo: 'Volador' },
    dark: { color: 'bg-gray-800', tipo: 'Siniestro' },
  }

  return tipos[tipoStr] || { color: 'bg-gray-500', tipo: tipoStr }
}

// Nuevo: función para obtener solo el nombre en español
export function getTipoEnEspanol(type) {
  const formatted = formatTipos(type)
  return formatted.tipo
}

// Nuevo: función para obtener opciones de tipos con valores en inglés pero etiquetas en español
export function getTiposOptions() {
  const tipos = [
    'grass',
    'fire',
    'water',
    'bug',
    'normal',
    'poison',
    'electric',
    'ground',
    'fairy',
    'fighting',
    'psychic',
    'rock',
    'ghost',
    'ice',
    'dragon',
    'steel',
    'flying',
    'dark',
  ]

  return tipos.map((type) => ({
    value: type,
    label: formatTipos(type).tipo,
    color: formatTipos(type).color,
  }))
}

// Nuevo: función para categorías
export function getCategoriasOptions() {
  return [
    { value: 'physical', label: 'Físico' },
    { value: 'special', label: 'Especial' },
    { value: 'status', label: 'Estado' },
  ]
}
