<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: Array,
})

const options = {
  chart: {
    id: 'vuechart-example',
    foreColor: '#1f2937', // Mantengo color oscuro para mejor visibilidad
    toolbar: {
      show: true,
      tools: {
        download: false,
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: false,
      },
    },
  },
  legend: {
    show: false,
  },
  plotOptions: {
    bar: {
      horizontal: true,
      distributed: true,
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#1f2937'],
      fontSize: '12px',
      fontWeight: 'bold',
    },
    formatter: function(val) {
      return val
    },
    offsetX: 10,
  },
  colors: [
    '#78C850', // PV
    '#F08030', // Ataque
    '#6890F0', // Defensa
    '#A890F0', // Ataque Especial
    '#98D8D8', // Defensa Especial
    '#CD1DF5', // Velocidad
  ],
  xaxis: {
    categories: ['PV', 'Ataque', 'Defensa', 'Ataque Especial', 'Defensa Especial', 'Velocidad'],
    labels: {
      style: {
        colors: '#1f2937',
        fontSize: '12px',
        fontWeight: '500',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#1f2937',
        fontSize: '12px',
        fontWeight: '500',
      },
    },
  },
  tooltip: {
    theme: 'light',
    style: {
      fontSize: '12px',
    },
  },
  grid: {
    borderColor: '#e5e7eb',
    strokeDashArray: 4,
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

    <!-- Total movido más abajo con margen superior -->
    <div class="mt-6 text-center font-bold text-lg">
      Estadística Total: {{ totalStats }}
    </div>
  </div>
</template>