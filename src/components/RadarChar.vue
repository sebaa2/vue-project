<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: Array,
})
const options = {
  chart: {
    type: 'radar',
  },
  xaxis: {
    categories: ['PV', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad'],
  },
  dataLabels: {
    enabled: true,
  },
  yaxis: {
    show: false,
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
</script>

<template>
  <div>
    <apexchart width="530" type="radar" :options="options" :series="series"></apexchart>
  </div>
</template>
