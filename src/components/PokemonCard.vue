<!-- src/components/PokemonCard.vue -->
<template>
  <router-link
    :to="`/details/${pokemon.id}`"
    class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group cursor-pointer block"
  >
    <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <img
        :src="imageUrl"
        :alt="pokemon.formattedName || pokemon.name"
        class="w-full h-32 object-contain group-hover:scale-110 transition-transform duration-300"
        loading="lazy"
        @error="(e) => handleError(e)"
      />
      
      <!-- Número del Pokémon -->
      <span class="absolute top-2 left-2 text-xs text-gray-400 font-mono">
        #{{ String(pokemon.id).padStart(4, '0') }}
      </span>
      
      <!-- Badge de generación -->
      <span
        :class="`absolute top-2 right-2 text-xs text-white px-1.5 py-0.5 rounded-full ${generationColor}`"
      >
        Gen {{ generation }}
      </span>
    </div>
    
    <div class="p-3">
      <h3 class="font-bold text-gray-800 text-center truncate">
        {{ pokemon.formattedName || formatName(pokemon.name) }}
      </h3>
      
      <div class="flex flex-wrap justify-center gap-1 mt-2">
        <span
          :class="getTypeColor(pokemon.primaryType)"
          class="px-2 py-0.5 rounded-full text-white text-xs"
        >
          {{ formatTipo(pokemon.primaryType) }}
        </span>
        
        <span
          v-if="pokemon.secondaryType"
          :class="getTypeColor(pokemon.secondaryType)"
          class="px-2 py-0.5 rounded-full text-white text-xs"
        >
          {{ formatTipo(pokemon.secondaryType) }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { usePokemonUtils } from '../composables/usePokemonUtils.js'
import { usePokemonGeneration } from '../composables/usePokemonGeneration.js'
import notFound from '../assets/images/noFound.png'

const props = defineProps({
  pokemon: {
    type: Object,
    required: true
  }
})

const { formatPokemonName, formatTipo, getTypeColor } = usePokemonUtils()
const { getPokemonGeneration, getGenerationColor } = usePokemonGeneration()

// Computed properties
const formatName = (name) => formatPokemonName(name)

const generation = computed(() => getPokemonGeneration(props.pokemon.id))
const generationColor = computed(() => getGenerationColor(generation.value))

const imageUrl = computed(() => {
  return props.pokemon.image ||
         props.pokemon.sprites?.other?.['official-artwork']?.front_default ||
         `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.pokemon.id}.png` ||
         notFound
})

const handleError = (event) => {
  const img = event.target
  
  if (img.src === notFound) return
  
  // Intentar con sprite normal
  img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${props.pokemon.id}.png`
  
  img.onerror = () => {
    img.src = notFound
    img.classList.add('image-error')
  }
}
</script>

<style scoped>
.image-error {
  opacity: 0.7;
  object-fit: contain;
  padding: 8px;
  filter: grayscale(0.3);
}
</style>