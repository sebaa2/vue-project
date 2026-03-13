export function formatTipos(type) {
  if (!type) return { color: 'bg-gray-500', tipo: 'Normal' }

  const tipoStr = typeof type === 'string' ? type : type.type

  const tipos = {
    grass: { color: 'bg-green-400', tipo: 'Planta' },
    fire: { color: 'bg-orange-400', tipo: 'Fuego' },
    water: { color: 'bg-blue-400', tipo: 'Agua' },
    bug: { color: 'bg-lime-400', tipo: 'Bicho' },
    // buscar mejor opcion para este color
    normal: { color: 'bg-gray-500', tipo: 'Normal' },
    poison: { color: 'bg-purple-500', tipo: 'Veneno' },
    electric: { color: 'bg-yellow-400', tipo: 'Eléctrico' },
    // no usar 300 en el tipo electrico
    ground: { color: 'bg-yellow-700', tipo: 'Tierra' },
    // dejarlo en 800 pero con letras de otro color maybe
    fairy: { color: 'bg-pink-500', tipo: 'Hada' },
    fighting: { color: 'bg-red-800', tipo: 'Lucha' },
    // se queda en 800 no lo cambies
    psychic: { color: 'bg-purple-700', tipo: 'Psíquico' },
    rock: { color: 'bg-stone-500', tipo: 'Roca' },
    ghost: { color: 'bg-violet-700', tipo: 'Fantasma' },
    ice: { color: 'bg-blue-300', tipo: 'Hielo' },
    dragon: { color: 'bg-indigo-700', tipo: 'Dragón' },
    steel: { color: 'bg-slate-400', tipo: 'Acero' },
    flying: { color: 'bg-indigo-400', tipo: 'Volador' },
    dark: { color: 'bg-gray-800 ', tipo: 'Siniestro' },
    // letras seba
  }

  return tipos[tipoStr] || { color: 'bg-gray-500', tipo: tipoStr }
}
