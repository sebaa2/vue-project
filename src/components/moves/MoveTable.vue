<!-- components/moves/MoveTable.vue -->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import MoveDetails from './MoveDetails.vue'
import MoveRow from './MoveRow.vue'
import { formatTipos, getCategoriasOptions } from '../../config/arrayTipo.js'
import physicalIcon from '../../assets/categories/physical.png'
import specialIcon from '../../assets/categories/special.png'
import statusIcon from '../../assets/categories/status.png'

// Constantes
const CATEGORY = { physical: physicalIcon, special: specialIcon, status: statusIcon }
const CATEGORY_LABEL = { physical: 'Físico', special: 'Especial', status: 'Estado' }
const LIGHT_TYPES = new Set(['normal', 'electric', 'ice', 'bug'])
const METHOD_STYLES = {
  'level-up': (m) =>
    m.levelLearnedAt === 0
      ? { label: 'Evo.', bg: 'bg-violet-100 text-violet-700' }
      : { label: `Nv. ${m.levelLearnedAt}`, bg: 'bg-sky-100 text-sky-700 font-mono' },
  machine: () => ({ label: 'MT/MO', bg: 'bg-amber-100 text-amber-700' }),
  egg: () => ({ label: 'Huevo', bg: 'bg-orange-100 text-orange-700' }),
  tutor: () => ({ label: 'Tutor', bg: 'bg-teal-100 text-teal-700' }),
}
const getPowerStyle = (p) =>
  !p || p === '-'
    ? 'text-gray-400'
    : p >= 120
      ? 'text-red-600 font-bold'
      : p >= 80
        ? 'text-orange-500 font-semibold'
        : p >= 40
          ? 'text-yellow-600'
          : 'text-gray-500'
const getPPColor = (p) =>
  !p
    ? 'text-gray-400'
    : p >= 30
      ? 'text-emerald-600 font-semibold'
      : p >= 15
        ? 'text-blue-500'
        : 'text-gray-500'

// Props
const props = defineProps({
  moves: Array,
  tipoOptions: Array,
  categoriaOptions: Array,
  methodOptions: Array,
})

// Estado
const expandedRows = ref({})
const expandedMove = ref(null)
const isMobile = ref(false)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
  learnMethod: { value: null, matchMode: FilterMatchMode.EQUALS },
})

// Helpers
const isDarkType = (t) => !LIGHT_TYPES.has(t)
const getCategoryStyle = (c) =>
  ({ physical: 'bg-red-500/90', special: 'bg-blue-500/90', status: 'bg-emerald-500/90' })[c] ||
  'bg-gray-400'
const formatName = (n) =>
  n.includes('-')
    ? n
        .split('-')
        .slice(1)
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join(' ')
    : n[0].toUpperCase() + n.slice(1)
const getLevelDisplay = (m) =>
  METHOD_STYLES[m.learnMethod]?.(m) || { label: '—', bg: 'text-gray-400' }

// Computed optimizados
const typeOpts = computed(() => props.tipoOptions?.filter((o) => o.value !== 'all') ?? [])
const catOpts = computed(() =>
  props.categoriaOptions?.filter((o) => o.value !== 'all')?.length
    ? props.categoriaOptions.filter((o) => o.value !== 'all')
    : getCategoriasOptions(),
)
const methodOpts = computed(() => props.methodOptions?.filter((o) => o.value !== 'all') ?? [])

// Computed para agregar un campo sortable de nivel a cada movimiento
const movesWithSortableLevel = computed(() => {
  if (!props.moves) return []
  return props.moves.map((move) => {
    let sortableLevel
    if (move.learnMethod === 'level-up') {
      // Evo. (levelLearnedAt === 0) va al final, los niveles normales se ordenan por número
      sortableLevel = move.levelLearnedAt === 0 ? 999 : move.levelLearnedAt
    } else {
      // Asigna valores para que los otros métodos tengan orden consistente
      const methodOrder = { machine: 1000, egg: 1001, tutor: 1002 }
      sortableLevel = methodOrder[move.learnMethod] || 1003
    }
    return { ...move, sortableLevel }
  })
})

// Computed para agregar un campo sortable de poder
const movesWithSortablePower = computed(() => {
  if (!props.moves) return []
  return props.moves.map((move) => {
    let sortablePower
    if (!move.power || move.power === '-') {
      sortablePower = -1 // Los movimientos sin poder van al final
    } else {
      sortablePower = Number(move.power)
    }
    return { ...move, sortablePower }
  })
})

// Combinar los campos sortable en un solo array
const movesWithSortables = computed(() => {
  if (!props.moves) return []
  const levelData = movesWithSortableLevel.value
  const powerData = movesWithSortablePower.value
  // Combinar ambos campos sortable en cada movimiento
  return levelData.map((move, index) => ({
    ...move,
    sortablePower: powerData[index]?.sortablePower ?? -1,
  }))
})

const filteredMoves = computed(() => {
  const g = filters.value.global.value?.toLowerCase()
  const n = filters.value.name.value?.toLowerCase()
  const t = filters.value.type.value
  const c = filters.value.category.value
  const m = filters.value.learnMethod.value
  if (!g && !n && !t && !c && !m) return movesWithSortables.value || []
  return (movesWithSortables.value || []).filter(
    (mv) =>
      (!g ||
        [mv.name, mv.type, mv.category, mv.learnMethod].some((f) =>
          f?.toLowerCase().includes(g),
        )) &&
      (!n || mv.name?.toLowerCase().includes(n)) &&
      (!t || mv.type === t) &&
      (!c || mv.category === c) &&
      (!m || mv.learnMethod === m),
  )
})
const hasFilters = computed(() =>
  Object.values(filters.value).some((f) => f.value != null && f.value !== ''),
)
const resetFilters = () =>
  (filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { value: null, matchMode: FilterMatchMode.CONTAINS },
    type: { value: null, matchMode: FilterMatchMode.EQUALS },
    category: { value: null, matchMode: FilterMatchMode.EQUALS },
    learnMethod: { value: null, matchMode: FilterMatchMode.EQUALS },
  })
const toggleMove = (n) => (expandedMove.value = expandedMove.value === n ? null : n)

// Responsive
const checkScreen = () => (isMobile.value = window.innerWidth < 768)
onMounted(() => {
  checkScreen()
  window.addEventListener('resize', checkScreen)
})
onUnmounted(() => window.removeEventListener('resize', checkScreen))
watch(
  () => props.moves,
  () => {
    resetFilters()
    expandedRows.value = {}
    expandedMove.value = null
  },
)
</script>

<template>
  <div class="move-table-wrapper">
    <!-- Mobile View -->
    <div v-if="isMobile" class="p-3">
      <div class="flex justify-between items-center mb-3">
        <div class="flex items-center gap-2">
          <div class="w-1 h-5 bg-red-500 rounded-full" />
          <span class="font-bold">Movimientos</span>
          <span class="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
            >{{ hasFilters ? `${filteredMoves.length} / ` : '' }}{{ moves?.length }}</span
          >
        </div>
        <button
          v-if="hasFilters"
          @click="resetFilters"
          class="text-xs text-red-500 px-2 py-1 rounded-lg bg-red-50"
        >
          ✕ Limpiar
        </button>
      </div>

      <div class="relative mb-2">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          :value="filters.global.value"
          @input="filters.global.value = $event.target.value || null"
          placeholder="Buscar..."
          class="w-full pl-9 pr-3 py-2 border rounded-xl bg-gray-50"
        />
      </div>

      <div class="grid grid-cols-3 gap-2 mb-3">
        <select
          :value="filters.type.value"
          @change="filters.type.value = $event.target.value || null"
          class="p-2 text-xs border rounded-xl bg-gray-50"
          :class="{ 'border-blue-400 bg-blue-50': filters.type.value }"
        >
          <option value="">Tipos</option>
          <option v-for="o in typeOpts" :value="o.value">{{ o.label }}</option>
        </select>
        <select
          :value="filters.category.value"
          @change="filters.category.value = $event.target.value || null"
          class="p-2 text-xs border rounded-xl bg-gray-50"
          :class="{ 'border-blue-400 bg-blue-50': filters.category.value }"
        >
          <option value="">Categorías</option>
          <option v-for="o in catOpts" :value="o.value">{{ o.label }}</option>
        </select>
        <select
          :value="filters.learnMethod.value"
          @change="filters.learnMethod.value = $event.target.value || null"
          class="p-2 text-xs border rounded-xl bg-gray-50"
          :class="{ 'border-blue-400 bg-blue-50': filters.learnMethod.value }"
        >
          <option value="">Métodos</option>
          <option v-for="o in methodOpts" :value="o.value">{{ o.label }}</option>
        </select>
      </div>

      <div class="border rounded-xl overflow-hidden max-h-[calc(100vh-340px)] overflow-y-auto">
        <MoveRow
          v-for="m in filteredMoves"
          :key="m.name"
          :move="m"
          :expandedMove="expandedMove"
          @toggle-details="toggleMove"
        />
        <div v-if="!filteredMoves.length" class="flex flex-col items-center py-8 text-gray-400">
          <span class="text-3xl">🔍</span>
          <p class="text-sm">Sin resultados</p>
          <button v-if="hasFilters" @click="resetFilters" class="text-xs text-blue-500 mt-2">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop View -->
    <DataTable
      v-else
      v-model:filters="filters"
      v-model:expandedRows="expandedRows"
      :value="filteredMoves"
      dataKey="name"
      filterDisplay="row"
      :globalFilterFields="['name', 'type', 'category', 'learnMethod']"
      paginator
      :rows="15"
      :rowsPerPageOptions="[10, 15, 25, 50]"
      removableSort
      scrollable
      scrollHeight="520px"
      stripedRows
      class="move-datatable"
    >
      <template #header>
        <div class="flex justify-between items-center p-3 bg-gray-50 border-b">
          <div class="flex items-center gap-2">
            <div class="w-1 h-5 bg-red-500 rounded-full" />
            <span class="font-semibold">Movimientos</span
            ><span class="text-xs bg-gray-200 px-2 py-0.5 rounded-full"
              >{{ hasFilters ? `${filteredMoves.length} / ` : '' }}{{ moves?.length }}</span
            ><button
              v-if="hasFilters"
              @click="resetFilters"
              class="text-xs text-red-500 px-2 py-0.5 rounded-full bg-red-50"
            >
              ✕ Limpiar
            </button>
          </div>
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span
            ><input
              :value="filters.global.value"
              @input="filters.global.value = $event.target.value || null"
              placeholder="Buscar..."
              class="pl-7 pr-3 py-1 border rounded-lg text-sm w-44 focus:w-52 transition-all"
            />
          </div>
        </div>
      </template>
      <Column expander style="width: 3.5rem" />
      <template #expansion="{ data }"
        ><div class="bg-gradient-to-r from-indigo-50 to-gray-100 border-l-4 border-indigo-500">
          <MoveDetails :move="data" /></div
      ></template>

      <template #empty
        ><div class="flex flex-col items-center py-12 text-gray-400">
          <span class="text-5xl opacity-40">⚔️</span>
          <p class="text-sm">Sin resultados</p>
          <button
            v-if="hasFilters"
            @click="resetFilters"
            class="text-xs text-blue-500 mt-2 bg-blue-50 px-3 py-1 rounded-full"
          >
            Limpiar
          </button>
        </div></template
      >

      <Column field="name" header="Movimiento" sortable style="min-width: 13rem">
        <template #body="{ data }"
          ><span class="font-semibold text-sm">{{ formatName(data.name) }}</span></template
        >
        <template #filter="{ filterModel, filterCallback }"
          ><InputText
            v-model="filterModel.value"
            @input="filterCallback()"
            placeholder="Nombre..."
            class="w-full text-xs"
        /></template>
      </Column>
      <Column
        field="type"
        header="Tipo"
        style="min-width: 9rem"
        :filterMatchModeOptions="[
          { label: 'Comienza con', value: FilterMatchMode.STARTS_WITH },
          { label: 'Contiene', value: FilterMatchMode.CONTAINS },
          { label: 'Termina con', value: FilterMatchMode.ENDS_WITH },
          { label: 'Es igual', value: FilterMatchMode.EQUALS },
        ]"
      >
        <template #body="{ data }"
          ><span
            :class="[
              formatTipos(data.type).color,
              isDarkType(data.type) ? 'text-white' : 'text-gray-800',
              'inline-block px-3 py-1 rounded-full text-xs font-semibold shadow w-full text-center capitalize',
            ]"
            >{{ formatTipos(data.type).tipo }}</span
          ></template
        >
        <template #filter="{ filterModel, filterCallback }"
          ><Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="typeOpts"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            showClear
            class="w-full text-xs"
        /></template>
      </Column>

      <Column field="category" header="Categoría" style="min-width: 10rem">
        <template #body="{ data }"
          ><span
            :class="[
              getCategoryStyle(data.category),
              'inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-semibold shadow',
            ]"
            ><img v-if="CATEGORY[data.category]" :src="CATEGORY[data.category]" class="h-3 w-3" />{{
              CATEGORY_LABEL[data.category] ?? data.category
            }}</span
          ></template
        >
        <template #filter="{ filterModel, filterCallback }"
          ><Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="catOpts"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas"
            showClear
            class="w-full text-xs"
        /></template>
      </Column>

      <Column
        field="learnMethod"
        header="Método"
        sortable
        :sortField="'sortableLevel'"
        style="min-width: 9rem"
      >
        <template #body="{ data }"
          ><span
            :class="[
              getLevelDisplay(data).bg,
              'inline-block px-2 py-0.5 rounded text-xs font-medium',
            ]"
            >{{ getLevelDisplay(data).label }}</span
          ></template
        >
        <template #filter="{ filterModel, filterCallback }"
          ><Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="methodOpts"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos"
            showClear
            class="w-full text-xs"
        /></template>
      </Column>

      <Column
        field="power"
        header="Poder"
        sortable
        :sortField="'sortablePower'"
        style="min-width: 6rem; text-align: center"
      >
        <template #body="{ data }">
          <div class="flex flex-col items-center">
            <span :class="getPowerStyle(data.power)" class="font-mono text-sm">{{
              data.power && data.power !== '-' ? data.power : '—'
            }}</span>
            <div
              v-if="data.power && data.power !== '-'"
              class="w-12 h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                class="h-full rounded-full"
                :class="
                  data.power >= 120
                    ? 'bg-red-400'
                    : data.power >= 80
                      ? 'bg-orange-400'
                      : data.power >= 40
                        ? 'bg-yellow-400'
                        : 'bg-gray-300'
                "
                :style="{ width: Math.min((Number(data.power) / 250) * 100, 100) + '%' }"
              />
            </div>
          </div>
        </template>
      </Column>

      <Column
        field="accuracy"
        header="Precisión"
        sortable
        style="min-width: 8rem; text-align: center"
      >
        <template #body="{ data }"
          ><div class="flex flex-col items-center">
            <span
              class="font-mono text-sm"
              :class="data.accuracy != null ? 'text-gray-700' : 'text-gray-400'"
              >{{ data.accuracy != null ? data.accuracy + '%' : '—' }}</span
            >
            <div
              v-if="data.accuracy != null"
              class="w-12 h-1 bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                class="h-full rounded-full"
                :class="
                  data.accuracy >= 90
                    ? 'bg-emerald-400'
                    : data.accuracy >= 70
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                "
                :style="{ width: data.accuracy + '%' }"
              />
            </div></div
        ></template>
      </Column>

      <Column field="pp" header="PP" sortable style="min-width: 5rem; text-align: center"
        ><template #body="{ data }"
          ><span :class="getPPColor(data.pp)" class="font-mono text-sm">{{
            data.pp || '—'
          }}</span></template
        ></Column
      >
    </DataTable>
  </div>
</template>

<style>
.move-datatable .p-datatable-thead > tr > th {
  background: #f9fafb !important;
  font-size: 0.7rem !important;
  padding: 0.5rem 0.75rem !important;
}
.move-datatable .p-datatable-filter-row > th {
  padding: 0.3rem 0.55rem !important;
}
.move-datatable .p-datatable-filter-row .p-inputtext,
.move-datatable .p-datatable-filter-row .p-select {
  font-size: 0.7rem !important;
  padding: 0.25rem 0.5rem !important;
  min-height: 28px !important;
}
.move-datatable .p-datatable-tbody > tr > td {
  padding: 0.4rem 0.75rem !important;
  font-size: 0.8rem !important;
}
.move-datatable .p-paginator {
  padding: 0.4rem !important;
}
.move-datatable .p-paginator-page-button,
.move-datatable .p-paginator-nav-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
}
</style>
