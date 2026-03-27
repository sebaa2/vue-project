// config/arrayTipo.js
export function formatTipos(type) {
  if (!type) return { color: 'bg-gray-500', tipo: 'Normal' }

  const tipoStr = typeof type === 'string' ? type : type.type

  const tipos = {
    grass: { color: 'bg-[#3FA129]', tipo: 'Planta' },
    fire: { color: 'bg-[#E62829]', tipo: 'Fuego' },
    water: { color: 'bg-[#2980EF]', tipo: 'Agua' },
    bug: { color: 'bg-[#91A119]', tipo: 'Bicho' },
    normal: { color: 'bg-[#9FA19F]', tipo: 'Normal' },
    poison: { color: 'bg-[#9141CB]', tipo: 'Veneno' },
    electric: { color: 'bg-[#FAC000]', tipo: 'Eléctrico' },
    ground: { color: 'bg-[#915121]', tipo: 'Tierra' },
    fairy: { color: 'bg-[#EF70EF]', tipo: 'Hada' },
    fighting: { color: 'bg-[#FF8000]', tipo: 'Lucha' },
    psychic: { color: 'bg-[#F95587]', tipo: 'Psíquico' },
    rock: { color: 'bg-[#AFA981]', tipo: 'Roca' },
    ghost: { color: 'bg-[#704170]', tipo: 'Fantasma' },
    ice: { color: 'bg-[#3DCEF3]', tipo: 'Hielo' },
    dragon: { color: 'bg-[#5060E1]', tipo: 'Dragón' },
    steel: { color: 'bg-[#60A1B8]', tipo: 'Acero' },
    flying: { color: 'bg-[#81B9EF]', tipo: 'Volador' },
    dark: { color: 'bg-[#624D4E]', tipo: 'Siniestro' },
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
