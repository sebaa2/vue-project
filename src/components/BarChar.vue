<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: Array,
})
const options = {
  chart: {
    id: 'vuechart-example',
  },
  legend: {
    show: false,
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
    },
  },
  colors: [
    '#78C850', // PV
    '#F08030', // Ataque
    '#6890F0', // Defensa
    '#A890F0', // Ataque Especial
    '#98D8D8', // Defensa Especial
    '#F8D030', // Velocidad
  ],
  xaxis: {
    categories: ['PV', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad'],
  },
}
const series = computed(() => {
  return [
    {
      name: 'Stats',
      data: props.stats,
    },
  ]
})
const totalStats = computed(() => {
  return props.stats.reduce((total, stat) => total + stat, 0)
})
</script>

<template>
  <div class="relative">
    <apexchart type="bar" :options="options" :series="series"></apexchart>

    <div class="absolute bottom-0.05 right-2 font-bold text-lg">
      Estadistica Total: {{ totalStats }}
    </div>
  </div>
</template>
