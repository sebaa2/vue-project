<script setup>
import { computed } from 'vue'

const props = defineProps({
    stats:Array
})
const options = {
        chart: {
          id: 'vuechart-example'
        },
        plotOptions: {
          bar: {
            horizontal: true,
          }
        },
        xaxis: {
          categories: ['PV', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad']
        }
      }
const series = computed(() => {
    return [
        {
          name: 'Stats',
          data: props.stats
        }
      ]
})
</script>

<template>
  <div>
    <apexchart width="500" type="bar" :options="options" :series="series"></apexchart>
  </div>
</template>
