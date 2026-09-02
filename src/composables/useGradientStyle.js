import { computed } from 'vue'

const TYPE_MAP = {
  planta: 'grass',
  fuego: 'fire',
  agua: 'water',
  bicho: 'bug',
  normal: 'normal',
  veneno: 'poison',
  eléctrico: 'electric',
  tierra: 'ground',
  hada: 'fairy',
  lucha: 'fighting',
  psíquico: 'psychic',
  roca: 'rock',
  fantasma: 'ghost',
  hielo: 'ice',
  dragón: 'dragon',
  acero: 'steel',
  volador: 'flying',
  siniestro: 'dark',
}

const TYPE_COLORS = {
  grass: '#3FA129',
  fire: '#E62829',
  water: '#2980EF',
  bug: '#91A119',
  normal: '#9FA19F',
  poison: '#9141CB',
  electric: '#FAC000',
  ground: '#915121',
  fairy: '#EF70EF',
  fighting: '#FF8000',
  psychic: '#F95587',
  rock: '#AFA981',
  ghost: '#704170',
  ice: '#3DCEF3',
  dragon: '#5060E1',
  steel: '#60A1B8',
  flying: '#81B9EF',
  dark: '#624D4E',
}

export function useGradientStyle(formattedTypes) {
  const headerGradientStyle = computed(() => {
    if (!formattedTypes.value?.length) {
      return 'linear-gradient(to right, #4b5563, #1f2937)'
    }

    const primaryTypeName = formattedTypes.value[0]?.tipo?.toLowerCase()
    const primaryTypeKey = TYPE_MAP[primaryTypeName] || primaryTypeName
    const primaryColor = TYPE_COLORS[primaryTypeKey] || '#4b5563'

    if (formattedTypes.value.length > 1) {
      const secondaryTypeName = formattedTypes.value[1]?.tipo?.toLowerCase()
      const secondaryTypeKey = TYPE_MAP[secondaryTypeName] || secondaryTypeName
      const secondaryColor = TYPE_COLORS[secondaryTypeKey] || primaryColor
      return `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`
    }

    return `linear-gradient(to right, ${primaryColor}, ${primaryColor}cc)`
  })

  return { headerGradientStyle }
}
