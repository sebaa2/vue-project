<!-- components/moves/MoveTable.vue -->
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import MoveDetails from './MoveDetails.vue'
import MoveRow from './MoveRow.vue'
import { formatTipos, getTiposOptions, getCategoriasOptions } from '../../config/arrayTipo.js'
import physicalIcon from '../../assets/categories/physical.png'
import specialIcon from '../../assets/categories/special.png'
import statusIcon from '../../assets/categories/status.png'

// ─── Props ────────────────────────────────────────────────────────────────────
const props = defineProps({
  moves: Array,
  tipoOptions: Array,
  categoriaOptions: Array,
  methodOptions: Array,
})

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORY_ICON = { physical: physicalIcon, special: specialIcon, status: statusIcon }
const CATEGORY_LABEL = { physical: 'Físico', special: 'Especial', status: 'Estado' }

// ─── Traducciones para filtros ──────────────────────────────────────────────
const filterMatchModes = [
  { label: 'Comienza con', value: FilterMatchMode.STARTS_WITH },
  { label: 'Contiene', value: FilterMatchMode.CONTAINS },
  { label: 'No contiene', value: FilterMatchMode.NOT_CONTAINS },
  { label: 'Termina con', value: FilterMatchMode.ENDS_WITH },
  { label: 'Es igual a', value: FilterMatchMode.EQUALS },
  { label: 'No es igual a', value: FilterMatchMode.NOT_EQUALS },
]

// ─── State ────────────────────────────────────────────────────────────────────
const expandedRows = ref({})
const expandedMove = ref(null)
const isMobile = ref(false)

const createDefaultFilters = () => ({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  name: { value: null, matchMode: FilterMatchMode.CONTAINS },
  type: { value: null, matchMode: FilterMatchMode.EQUALS },
  category: { value: null, matchMode: FilterMatchMode.EQUALS },
  learnMethod: { value: null, matchMode: FilterMatchMode.EQUALS },
})
const filters = ref(createDefaultFilters())

// ─── Responsive ───────────────────────────────────────────────────────────────
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768
}
onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})
onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})

watch(
  () => props.moves,
  () => {
    filters.value = createDefaultFilters()
    expandedRows.value = {}
    expandedMove.value = null
  },
)

// ─── Helpers visuales ─────────────────────────────────────────────────────────
// Función para determinar si el tipo necesita texto oscuro
const isDarkType = (type) => {
  const lightTypes = ['normal', 'electric', 'ice', 'bug']
  return !lightTypes.includes(type)
}

const getCategoryStyle = (cat) =>
  ({
    physical: { bg: 'bg-red-500/90', shadow: 'shadow-red-200' },
    special: { bg: 'bg-blue-500/90', shadow: 'shadow-blue-200' },
    status: { bg: 'bg-emerald-500/90', shadow: 'shadow-emerald-200' },
  })[cat] ?? { bg: 'bg-gray-400', shadow: 'shadow-gray-200' }

const formatAccuracy = (acc) => ((!acc && acc !== 0) || acc === null ? null : Number(acc))

const formatName = (name) => {
  const parts = name.split('-')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  return parts
    .slice(1)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

const getLevelDisplay = (move) => {
  const { learnMethod: m, levelLearnedAt: l } = move
  if (m === 'level-up') {
    if (l === 0)
      return { label: 'Evo.', bg: 'bg-violet-100 text-violet-700 border border-violet-200' }
    return {
      label: `Nv. ${l}`,
      bg: 'bg-sky-100    text-sky-700    border border-sky-200 font-mono',
    }
  }
  if (m === 'machine')
    return { label: 'MT/MO', bg: 'bg-amber-100  text-amber-700  border border-amber-200' }
  if (m === 'egg')
    return { label: 'Huevo', bg: 'bg-orange-100 text-orange-700 border border-orange-200' }
  if (m === 'tutor')
    return { label: 'Tutor', bg: 'bg-teal-100   text-teal-700   border border-teal-200' }
  return { label: '—', bg: 'text-gray-400' }
}

const getPowerColor = (power) => {
  if (!power || power === '-') return 'text-gray-400'
  const p = Number(power)
  if (p >= 120) return 'text-red-600 font-bold'
  if (p >= 80) return 'text-orange-500 font-semibold'
  if (p >= 40) return 'text-yellow-600'
  return 'text-gray-500'
}

const getPPColor = (pp) => {
  if (!pp) return 'text-gray-400'
  if (pp >= 30) return 'text-emerald-600 font-semibold'
  if (pp >= 15) return 'text-blue-500'
  return 'text-gray-500'
}

// ─── Opciones sin "Todos" ─────────────────────────────────────────────────────
const typeFilterOptions = computed(() => {
  if (!props.tipoOptions) return []
  return props.tipoOptions.filter((o) => o.value !== 'all')
})

const categoryFilterOptions = computed(() => {
  if (!props.categoriaOptions) return []
  const allCatOpts = getCategoriasOptions()
  const available = props.categoriaOptions.filter((o) => o.value !== 'all')
  return available.length ? available : allCatOpts
})

const methodFilterOptions = computed(() => {
  if (!props.methodOptions) return []
  return props.methodOptions.filter((o) => o.value !== 'all')
})

// ─── Filtrado mobile ──────────────────────────────────────────────────────────
const mobileFilteredMoves = computed(() => {
  const g = filters.value.global.value?.toLowerCase()
  const n = filters.value.name.value?.toLowerCase()
  const t = filters.value.type.value
  const c = filters.value.category.value
  const m = filters.value.learnMethod.value
  return (props.moves ?? []).filter((mv) => {
    if (
      g &&
      ![mv.name, mv.type, mv.category, mv.learnMethod].some((f) => f?.toLowerCase().includes(g))
    )
      return false
    if (n && !mv.name?.toLowerCase().includes(n)) return false
    if (t && mv.type !== t) return false
    if (c && mv.category !== c) return false
    if (m && mv.learnMethod !== m) return false
    return true
  })
})

const hasActiveFilters = computed(() =>
  Object.values(filters.value).some((f) => f.value !== null && f.value !== ''),
)
const filteredCount = computed(() => mobileFilteredMoves.value.length)
const resetAllFilters = () => {
  filters.value = createDefaultFilters()
}
const toggleMoveDetails = (name) => {
  expandedMove.value = expandedMove.value === name ? null : name
}
</script>

<template>
  <div class="move-table-wrapper">
    <!-- ═══════════════════════════════════════════════════
         VISTA MOBILE
         ═══════════════════════════════════════════════════ -->
    <div v-if="isMobile">
      <div class="mb-3 flex flex-col gap-2.5">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <div class="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
            <span class="font-bold text-gray-800 text-lg">Movimientos</span>
            <span class="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {{ hasActiveFilters ? `${filteredCount} / ` : '' }}{{ moves?.length }}
            </span>
          </div>
          <button
            v-if="hasActiveFilters"
            @click="resetAllFilters"
            class="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            ✕ Limpiar
          </button>
        </div>

        <div class="relative">
          <span
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"
            >🔍</span
          >
          <input
            :value="filters.global.value"
            @input="filters.global.value = $event.target.value || null"
            type="text"
            placeholder="Buscar movimiento..."
            class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white text-sm transition-all"
          />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <select
            :value="filters.type.value"
            @change="filters.type.value = $event.target.value || null"
            class="px-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white transition-all"
            :class="{ 'border-blue-400 bg-blue-50 text-blue-700 font-medium': filters.type.value }"
          >
            <option value="">Todos los tipos</option>
            <option v-for="opt in typeFilterOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select
            :value="filters.category.value"
            @change="filters.category.value = $event.target.value || null"
            class="px-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white transition-all"
            :class="{
              'border-blue-400 bg-blue-50 text-blue-700 font-medium': filters.category.value,
            }"
          >
            <option value="">Todas las categorías</option>
            <option v-for="opt in categoryFilterOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <select
            :value="filters.learnMethod.value"
            @change="filters.learnMethod.value = $event.target.value || null"
            class="px-2 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white transition-all"
            :class="{
              'border-blue-400 bg-blue-50 text-blue-700 font-medium': filters.learnMethod.value,
            }"
          >
            <option value="">Todos los métodos</option>
            <option v-for="opt in methodFilterOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        class="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        style="max-height: calc(100vh - 340px); overflow-y: auto"
      >
        <template v-if="mobileFilteredMoves.length > 0">
          <MoveRow
            v-for="(move, index) in mobileFilteredMoves"
            :key="move.name"
            :move="move"
            :index="index"
            :expandedMove="expandedMove"
            @toggle-details="toggleMoveDetails"
          />
        </template>
        <div v-else class="flex flex-col items-center justify-center h-32 text-gray-400 gap-2">
          <span class="text-3xl">🔍</span>
          <p class="text-sm">Sin resultados</p>
          <button
            v-if="hasActiveFilters"
            @click="resetAllFilters"
            class="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════
         VISTA DESKTOP – PrimeVue DataTable
         ═══════════════════════════════════════════════════ -->
    <DataTable
      v-else
      v-model:filters="filters"
      v-model:expandedRows="expandedRows"
      :value="moves"
      dataKey="name"
      filterDisplay="row"
      :globalFilterFields="['name', 'type', 'category', 'learnMethod']"
      paginator
      :rows="15"
      :rowsPerPageOptions="[10, 15, 25, 50]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      removableSort
      scrollable
      scrollHeight="520px"
      stripedRows
      class="move-datatable"
    >
      <!-- ── Header mejorado ────────────────────────────────────────────── -->
      <template #header>
        <div class="dt-header">
          <div class="flex items-center gap-3">
            <div class="header-accent-bar" />
            <span class="dt-title">Movimientos</span>
            <span class="dt-count">
              <template v-if="hasActiveFilters">{{ filteredCount }}&nbsp;/&nbsp;</template
              >{{ moves?.length }}
            </span>
            <button v-if="hasActiveFilters" @click="resetAllFilters" class="dt-clear-btn">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Limpiar
            </button>
          </div>
          <div class="dt-search-wrap">
            <svg class="dt-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              :value="filters['global'].value"
              @input="filters['global'].value = $event.target.value || null"
              placeholder="Buscar movimiento..."
              class="dt-search-input"
            />
          </div>
        </div>
      </template>

      <!-- ── Sin resultados ────────────────────────────────────── -->
      <template #empty>
        <div class="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
          <span class="text-5xl opacity-40">⚔️</span>
          <p class="text-sm font-medium">Sin movimientos que coincidan</p>
          <button
            v-if="hasActiveFilters"
            @click="resetAllFilters"
            class="text-xs text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      </template>

      <!-- ── TIPO mejorado con contraste automático ─────────────────────── -->
      <Column
        field="type"
        header="Tipo"
        style="min-width: 9rem"
        :filterMatchModeOptions="filterMatchModes"
      >
        <template #body="{ data }">
          <span
            :class="[
              formatTipos(data.type).color,
              isDarkType(data.type) ? 'text-white' : 'text-gray-800',
              'type-pill',
            ]"
          >
            {{ formatTipos(data.type).tipo }}
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="typeFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los tipos"
            showClear
            class="dt-filter-select"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <span
                  :class="[
                    slotProps.option.color,
                    isDarkType(slotProps.option.value) ? 'text-white' : 'text-gray-800',
                    'w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold',
                  ]"
                >
                  {{ slotProps.option.label.charAt(0) }}
                </span>
                <span>{{ slotProps.option.label }}</span>
              </div>
            </template>
          </Select>
        </template>
      </Column>

      <!-- ── CATEGORÍA ─────────────────────────────────────────── -->
      <Column
        field="category"
        header="Categoría"
        style="min-width: 10rem"
        :filterMatchModeOptions="filterMatchModes"
      >
        <template #body="{ data }">
          <span
            :class="[getCategoryStyle(data.category).bg, getCategoryStyle(data.category).shadow]"
            class="cat-pill"
          >
            <img
              v-if="CATEGORY_ICON[data.category]"
              :src="CATEGORY_ICON[data.category]"
              :alt="data.category"
              class="h-4 w-4 drop-shadow-sm"
            />
            {{ CATEGORY_LABEL[data.category] ?? data.category }}
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="categoryFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todas las categorías"
            showClear
            class="dt-filter-select"
          />
        </template>
      </Column>

      <!-- ── MOVIMIENTO ────────────────────────────────────────── -->
      <Column
        field="name"
        header="Movimiento"
        sortable
        style="min-width: 13rem"
        :filterMatchModeOptions="filterMatchModes"
      >
        <template #body="{ data }">
          <span class="move-name-cell">{{ formatName(data.name) }}</span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <InputText
            v-model="filterModel.value"
            type="text"
            @input="filterCallback()"
            placeholder="Nombre..."
            class="dt-filter-input"
          />
        </template>
      </Column>

      <!-- ── MÉTODO ────────────────────────────────────────────── -->
      <Column
        field="learnMethod"
        header="Método"
        sortField="levelLearnedAt"
        sortable
        style="min-width: 9rem"
        :filterMatchModeOptions="filterMatchModes"
      >
        <template #body="{ data }">
          <span :class="getLevelDisplay(data).bg" class="method-pill">
            {{ getLevelDisplay(data).label }}
          </span>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <Select
            v-model="filterModel.value"
            @change="filterCallback()"
            :options="methodFilterOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Todos los métodos"
            showClear
            class="dt-filter-select"
          />
        </template>
      </Column>

      <!-- ── PODER ─────────────────────────────────────────────── -->
      <Column field="power" header="Poder" sortable style="min-width: 6rem; text-align: center">
        <template #body="{ data }">
          <div class="stat-col">
            <span :class="getPowerColor(data.power)" class="font-mono text-sm">
              {{ data.power && data.power !== '-' ? data.power : '—' }}
            </span>
            <div v-if="data.power && data.power !== '-'" class="mini-bar-wrap">
              <div
                class="mini-bar"
                :style="{ width: Math.min((Number(data.power) / 250) * 100, 100) + '%' }"
                :class="{
                  'bg-red-400': Number(data.power) >= 120,
                  'bg-orange-400': Number(data.power) >= 80 && Number(data.power) < 120,
                  'bg-yellow-400': Number(data.power) >= 40 && Number(data.power) < 80,
                  'bg-gray-300': Number(data.power) < 40,
                }"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- ── PP ────────────────────────────────────────────────── -->
      <Column field="pp" header="PP" sortable style="min-width: 5rem; text-align: center">
        <template #body="{ data }">
          <span :class="getPPColor(data.pp)" class="font-mono text-sm">{{ data.pp || '—' }}</span>
        </template>
      </Column>

      <!-- ── PRECISIÓN ─────────────────────────────────────────── -->
      <Column
        field="accuracy"
        header="Precisión"
        sortable
        style="min-width: 8rem; text-align: center"
      >
        <template #body="{ data }">
          <div class="stat-col">
            <span
              class="font-mono text-sm"
              :class="formatAccuracy(data.accuracy) !== null ? 'text-gray-700' : 'text-gray-400'"
            >
              {{
                formatAccuracy(data.accuracy) !== null ? formatAccuracy(data.accuracy) + '%' : '—'
              }}
            </span>
            <div v-if="formatAccuracy(data.accuracy) !== null" class="mini-bar-wrap">
              <div
                class="mini-bar"
                :style="{ width: formatAccuracy(data.accuracy) + '%' }"
                :class="{
                  'bg-emerald-400': formatAccuracy(data.accuracy) >= 90,
                  'bg-yellow-400':
                    formatAccuracy(data.accuracy) >= 70 && formatAccuracy(data.accuracy) < 90,
                  'bg-red-400': formatAccuracy(data.accuracy) < 70,
                }"
              />
            </div>
          </div>
        </template>
      </Column>

      <!-- ── EXPANDER ──────────────────────────────────────────── -->
      <Column expander style="width: 3.5rem" />

      <!-- ── PANEL EXPANDIDO ───────────────────────────────────── -->
      <template #expansion="{ data }">
        <div class="expansion-wrap">
          <MoveDetails :move="data" />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<style scoped>
.move-table-wrapper {
  font-family: inherit;
}

/* ─── HEADER MEJORADO - Más limpio y sutil ───────────────────────────────── */
.dt-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
  border-radius: 0.5rem 0.5rem 0 0;
}
.header-accent-bar {
  width: 3px;
  height: 1.25rem;
  background: #ef4444;
  border-radius: 2px;
  flex-shrink: 0;
}
.dt-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  letter-spacing: normal;
}
.dt-count {
  font-size: 0.7rem;
  font-family: ui-monospace, monospace;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}
.dt-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: #ef4444;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: #fef2f2;
  cursor: pointer;
  transition: all 0.15s;
}
.dt-clear-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ─── Search ──────────────────────────────────────────────────────────────── */
.dt-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.dt-search-icon {
  position: absolute;
  left: 0.6rem;
  width: 0.875rem;
  height: 0.875rem;
  color: #9ca3af;
  pointer-events: none;
}
.dt-search-input {
  padding: 0.35rem 0.7rem 0.35rem 1.8rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.8rem;
  width: 180px;
  outline: none;
  transition: all 0.2s;
}
.dt-search-input::placeholder {
  color: #9ca3af;
  font-size: 0.75rem;
}
.dt-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  width: 200px;
}

/* ─── Badges mejorados ───────────────────────────────────────────────────── */
.type-pill {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-transform: capitalize;
  transition: all 0.2s ease;
}
.type-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.method-pill {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.74rem;
  font-weight: 500;
}
.move-name-cell {
  font-weight: 600;
  font-size: 0.88rem;
  color: #1e293b;
}

/* ─── Stat column con mini-bar ───────────────────────────────────────────── */
.stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.mini-bar-wrap {
  width: 100%;
  max-width: 3.5rem;
  height: 3px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}
.mini-bar {
  height: 100%;
  border-radius: 9999px;
  min-width: 3px;
  transition: width 0.3s ease;
}

/* ─── Expansion panel ────────────────────────────────────────────────────── */
.expansion-wrap {
  background: linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%);
  border-top: 2px solid #e0e7ff;
  border-left: 4px solid #6366f1;
}

/* ─── Filter controls ────────────────────────────────────────────────────── */
.dt-filter-select,
.dt-filter-input {
  width: 100%;
  font-size: 0.78rem !important;
}
</style>

<!-- ════════════════════════════════════════════════════
     Deep overrides — PrimeVue DataTable internals
     ════════════════════════════════════════════════════ -->
<style>
/* ── Columnas header - Más compactas ──────────────────────────────────────── */
.move-datatable .p-datatable-thead > tr > th {
  background: #f9fafb !important;
  color: #4b5563 !important;
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.03em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 0.6rem 0.75rem !important;
}

/* Sort icons más pequeños */
.move-datatable .p-datatable-sort-icon {
  width: 0.875rem !important;
  height: 0.875rem !important;
  font-size: 0.7rem !important;
}

/* ── Fila de filtros - Más compacta ───────────────────────────────────────── */
.move-datatable .p-datatable-thead > tr.p-datatable-filter-row > th {
  background: #ffffff !important;
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 0.4rem 0.55rem !important;
}
.move-datatable .p-datatable-filter-row .p-inputtext,
.move-datatable .p-datatable-filter-row .p-select {
  background: white !important;
  border-color: #e5e7eb !important;
  color: #374151 !important;
  font-size: 0.72rem !important;
  padding: 0.35rem 0.5rem !important;
  border-radius: 0.375rem !important;
  min-height: 28px !important;
}
.move-datatable .p-datatable-filter-row .p-select-label {
  padding: 0.2rem 0.5rem !important;
  font-size: 0.72rem !important;
}
.move-datatable .p-datatable-filter-row .p-select-dropdown {
  width: 1.5rem !important;
}

/* ── Body rows - Tamaño ajustado ──────────────────────────────────────────── */
.move-datatable .p-datatable-tbody > tr > td {
  padding: 0.5rem 0.75rem !important;
  border-bottom: 1px solid #f5f5f5 !important;
  font-size: 0.8rem !important;
}

/* ── Paginador más compacto ───────────────────────────────────────────────── */
.move-datatable .p-paginator {
  padding: 0.5rem 0.75rem !important;
}
.move-datatable .p-paginator-page-button,
.move-datatable .p-paginator-nav-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
  font-size: 0.75rem !important;
}
.move-datatable .p-paginator-rpp-select {
  font-size: 0.7rem !important;
  padding: 0.2rem 0.5rem !important;
}

/* ─── Mejora visual para el select de tipos con colores ────────────────────── */
.move-datatable .p-select-option {
  padding: 0.35rem 0.75rem !important;
}
.move-datatable .p-select-option .flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>

<style scoped>
.move-table-wrapper {
  font-family: inherit;
}

/* ─── HEADER MEJORADO - Más limpio y sutil ───────────────────────────────── */
.dt-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f6;
  border-radius: 0.5rem 0.5rem 0 0;
}
.header-accent-bar {
  width: 3px;
  height: 1.25rem;
  background: #ef4444;
  border-radius: 2px;
  flex-shrink: 0;
}
.dt-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: #1f2937;
  letter-spacing: normal;
}
.dt-count {
  font-size: 0.7rem;
  font-family: ui-monospace, monospace;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}
.dt-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  color: #ef4444;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: #fef2f2;
  cursor: pointer;
  transition: all 0.15s;
}
.dt-clear-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* ─── Search ──────────────────────────────────────────────────────────────── */
.dt-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.dt-search-icon {
  position: absolute;
  left: 0.6rem;
  width: 0.875rem;
  height: 0.875rem;
  color: #9ca3af;
  pointer-events: none;
}
.dt-search-input {
  padding: 0.35rem 0.7rem 0.35rem 1.8rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.8rem;
  width: 180px;
  outline: none;
  transition: all 0.2s;
}
.dt-search-input::placeholder {
  color: #9ca3af;
  font-size: 0.75rem;
}
.dt-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  width: 200px;
}

/* ─── Badges mejorados ───────────────────────────────────────────────────── */
.type-pill {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  width: 100%;
  text-transform: capitalize;
  transition: all 0.2s ease;
}
.type-pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.cat-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.method-pill {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 0.4rem;
  font-size: 0.74rem;
  font-weight: 500;
}
.move-name-cell {
  font-weight: 600;
  font-size: 0.88rem;
  color: #1e293b;
}

/* ─── Stat column con mini-bar ───────────────────────────────────────────── */
.stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.mini-bar-wrap {
  width: 100%;
  max-width: 3.5rem;
  height: 3px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}
.mini-bar {
  height: 100%;
  border-radius: 9999px;
  min-width: 3px;
  transition: width 0.3s ease;
}

/* ─── Expansion panel ────────────────────────────────────────────────────── */
.expansion-wrap {
  background: linear-gradient(135deg, #f8faff 0%, #f1f5f9 100%);
  border-top: 2px solid #e0e7ff;
  border-left: 4px solid #6366f1;
}

/* ─── Filter controls ────────────────────────────────────────────────────── */
.dt-filter-select,
.dt-filter-input {
  width: 100%;
  font-size: 0.78rem !important;
}
</style>

<!-- ════════════════════════════════════════════════════
     Deep overrides — PrimeVue DataTable internals
     ════════════════════════════════════════════════════ -->
<style>
/* ── Columnas header - Más compactas ──────────────────────────────────────── */
.move-datatable .p-datatable-thead > tr > th {
  background: #f9fafb !important;
  color: #4b5563 !important;
  font-size: 0.7rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.03em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding: 0.6rem 0.75rem !important;
}

/* Sort icons más pequeños */
.move-datatable .p-datatable-sort-icon {
  width: 0.875rem !important;
  height: 0.875rem !important;
  font-size: 0.7rem !important;
}

/* ── Fila de filtros - Más compacta ───────────────────────────────────────── */
.move-datatable .p-datatable-thead > tr.p-datatable-filter-row > th {
  background: #ffffff !important;
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 0.4rem 0.55rem !important;
}
.move-datatable .p-datatable-filter-row .p-inputtext,
.move-datatable .p-datatable-filter-row .p-select {
  background: white !important;
  border-color: #e5e7eb !important;
  color: #374151 !important;
  font-size: 0.72rem !important;
  padding: 0.35rem 0.5rem !important;
  border-radius: 0.375rem !important;
  min-height: 28px !important;
}
.move-datatable .p-datatable-filter-row .p-select-label {
  padding: 0.2rem 0.5rem !important;
  font-size: 0.72rem !important;
}
.move-datatable .p-datatable-filter-row .p-select-dropdown {
  width: 1.5rem !important;
}

/* ── Body rows - Tamaño ajustado ──────────────────────────────────────────── */
.move-datatable .p-datatable-tbody > tr > td {
  padding: 0.5rem 0.75rem !important;
  border-bottom: 1px solid #f5f5f5 !important;
  font-size: 0.8rem !important;
}

/* ── Paginador más compacto ───────────────────────────────────────────────── */
.move-datatable .p-paginator {
  padding: 0.5rem 0.75rem !important;
}
.move-datatable .p-paginator-page-button,
.move-datatable .p-paginator-nav-button {
  width: 1.75rem !important;
  height: 1.75rem !important;
  font-size: 0.75rem !important;
}
.move-datatable .p-paginator-rpp-select {
  font-size: 0.7rem !important;
  padding: 0.2rem 0.5rem !important;
}

/* ─── Mejora visual para el select de tipos con colores ────────────────────── */
.move-datatable .p-select-option {
  padding: 0.35rem 0.75rem !important;
}
.move-datatable .p-select-option .flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
