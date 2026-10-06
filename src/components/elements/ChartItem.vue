<template>
    <!-- PANEL charts -->
    <section v-if="isPanel" class="chart-block chart-block--panel" :class="panelVariantClass">
        <header v-if="hasHeader" class="panel__header" :class="{ 'panel__header--split': element.type === 'velocimeter' }">
            <div v-if="element.type === 'velocimeter'" class="panel__side">
                <div v-if="element.title" class="panel__title">{{ element.title }}</div>
                <div v-if="element.subtitle" class="panel__subtitle">{{ element.subtitle }}</div>
            </div>

            <template v-else>
                <div v-if="element.title" class="panel__title">{{ element.title }}</div>
                <div v-if="element.subtitle" class="panel__subtitle">{{ element.subtitle }}</div>
            </template>
        </header>

        <div
            ref="chartDom"
            class="panel__chart"
            :class="panelChartClass"
            :style="chartDomStyle"
        />

        <div v-if="props.element.type === 'doughnut_chart'" class="donut-legend">
            <div class="donut-legend__col">
                <div
                    v-for="it in doughnutLegendCols.left"
                    :key="it.name"
                    class="donut-legend__item"
                >
                    <span class="donut-legend__dot" :style="{ backgroundColor: it.color }"></span>
                    <span class="donut-legend__label">{{ it.name }}</span>
                    <span class="donut-legend__pct">{{ it.pct }}</span>
                </div>
            </div>

            <div class="donut-legend__col">
                <div
                    v-for="it in doughnutLegendCols.right"
                    :key="it.name"
                    class="donut-legend__item"
                >
                    <span class="donut-legend__dot" :style="{ backgroundColor: it.color }"></span>
                    <span class="donut-legend__label">{{ it.name }}</span>
                    <span class="donut-legend__pct">{{ it.pct }}</span>
                </div>
            </div>
        </div>

        <div v-if="props.element.type === 'pie_chart'" class="pie-legend">
            <div class="pie-legend__col">
                <div v-for="it in pieLegendCols.left" :key="it.name" class="pie-legend__item">
                    <span class="pie-legend__dot" :style="{ backgroundColor: it.color }" />
                    <span class="pie-legend__label">{{ it.name }}</span>
                    <span class="pie-legend__pct">{{ it.pct }}</span>
                </div>
            </div>
            <div class="pie-legend__col">
                <div v-for="it in pieLegendCols.right" :key="it.name" class="pie-legend__item">
                    <span class="pie-legend__dot" :style="{ backgroundColor: it.color }" />
                    <span class="pie-legend__label">{{ it.name }}</span>
                    <span class="pie-legend__pct">{{ it.pct }}</span>
                </div>
            </div>
        </div>
    </section>

    <!-- SIMPLE charts -->
    <section v-else class="chart-block chart-block--simple" :class="{ 'chart-block--card': isCardChart }">
        <div v-if="element.title" class="chart-block__title" :class="{ 'chart-block__title--card': isCardChart }">{{ element.title }}</div>
        <div
            ref="chartDom"
            class="chart-block__canvas"
            :class="{ 'chart-block__canvas--scatter': element.type === 'scatter_plot' }"
            :style="chartDomStyle"
        />

        <!-- Leyenda de severidad (horizontal_bar variant="severity_list") — HTML, no canvas. -->
        <div v-if="hBarLegend" class="hbar-legend">
            <div v-for="item in hBarLegend" :key="item.label" class="hbar-legend__item">
                <span class="hbar-legend__dot" :style="{ backgroundColor: item.color }" />
                <span class="hbar-legend__label">{{ item.label }}</span>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import * as theme from '../../theme'
import { PdfElement } from '../../types'
import { buildChartOption, DEFAULT_CHART_COLORS } from '../chartOptionBuilders'

const props = defineProps<{ element: PdfElement }>()

const chartDom = ref<HTMLElement | null>(null)
let myChart: echarts.ECharts | null = null

const isPanel = computed(() =>
    ['radar_chart', 'pie_chart', 'doughnut_chart', 'velocimeter'].includes(props.element.type)
)

// "Simple" charts (no van por isPanel) que igual deben verse como una card con borde, igual
// al resto de los componentes del reporte (Detalle por Dimensión, Departamentos) — hoy solo
// horizontal_bar (ej. "Score por Departamento"); el resto (bar_chart/stacked_bar/scatter_plot)
// no los usan.
const isCardChart = computed(() => props.element.type === 'horizontal_bar')

const hasHeader = computed(() => !!props.element.title || !!(props.element as any).subtitle)

const panelVariantClass = computed(() => ({
    'panel panel--radar': props.element.type === 'radar_chart',
    'panel panel--pie': props.element.type === 'pie_chart',
    'panel panel--doughnut': props.element.type === 'doughnut_chart',
    'panel panel--velocimeter': props.element.type === 'velocimeter',
}))

const panelChartClass = computed(() => ({
    'panel__chart--radar': props.element.type === 'radar_chart',
    'panel__chart--pie': props.element.type === 'pie_chart',
    'panel__chart--doughnut': props.element.type === 'doughnut_chart',
    'panel__chart--velocimeter': props.element.type === 'velocimeter',
}))

/** -------------------------
 *  Dynamic height heuristics
 *  ------------------------- */
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const len = (v: any) => String(v ?? '').length

const countFromElement = (el: any) => {
    if (Array.isArray(el.data)) return el.data.length
    if (Array.isArray(el.labels)) return el.labels.length
    if (Array.isArray(el.values)) return el.values.length
    if (Array.isArray(el.positions)) return el.positions.length
    return 0
}

const dynamicHeight = computed(() => {
    const el: any = props.element
    const type = props.element.type
    const n = countFromElement(el)
    const longestLabel =
        Math.max(
            0,
            ...(Array.isArray(el.labels) ? el.labels.map((x: any) => len(x)) : []),
            ...(Array.isArray(el.data) ? el.data.map((d: any) => len(d?.label)) : [])
        )

    // Baselines por tipo (tus actuales)
    const BASE = {
        bar_chart: 340,
        horizontal_bar: 360,
        stacked_bar: 360,
        pie_chart: 420,
        doughnut_chart: 420,
        radar_chart: 460,
        velocimeter: 180,
        scatter_plot: 420,
    } as Record<string, number>

    // helpers para crecer “por necesidad”
    const growByRows = (base: number) => base + clamp((n - 6) * 32, 0, 420) // tablas de barras horizontales
    const growByLegend = (base: number) => base + clamp((n - 8) * 26, 0, 360) // pies/doughnuts con legend grande
    const growByLabels = (base: number) => base + clamp((longestLabel - 16) * 6, 0, 220) // labels largos
    const growByAxes = (base: number) => base + clamp((n - 8) * 18, 0, 220) // bar/radar con muchos ejes

    switch (type) {
        case 'horizontal_bar':
            // más filas + labels largos necesitan más alto
            return clamp(growByLabels(growByRows(BASE.horizontal_bar)), 340, 820)

        case 'bar_chart':
            // muchas categorías -> más alto
            return clamp(growByAxes(growByLabels(BASE.bar_chart)), 340, 700)

        case 'stacked_bar':
            // muchas categorías + legend arriba
            return clamp(growByAxes(growByLabels(BASE.stacked_bar)) + (n > 10 ? 40 : 0), 360, 760)

        case 'pie_chart':
            const labels = 
                Array.isArray(el.labels) ? el.labels.map((x: any) => String(x)) :
                    Array.isArray(el.data) ? el.data.map((d: any) => String(d?.label ?? '')) :
                        [] 

            const labelCount = labels.length
            const maxLen = Math.max(0, ...labels.map((s: string) => s.length))

            const byItems = clamp((labelCount - 6) * 6, 0, 48)
            const byLen = clamp((maxLen - 18) * 2, 0, 60)

            return clamp(280 + byItems + byLen, 150, 360)

        case 'doughnut_chart': {
            const labels =
                Array.isArray(el.labels) ? el.labels.map((x: any) => String(x)) :
                    Array.isArray(el.data) ? el.data.map((d: any) => String(d?.label ?? '')) :
                        []

            const labelCount = labels.length
            const maxLen = Math.max(0, ...labels.map((s: string) => s.length))

            // ✅ el legend ya es HTML, así que el canvas debe ser compacto
            const byItems = clamp((labelCount - 6) * 6, 0, 48)
            const byLen = clamp((maxLen - 18) * 2, 0, 60)

            return clamp(330 + byItems + byLen, 300, 420)
        }

        case 'radar_chart':
            // ejes + labels largos -> mucho espacio
            return clamp(growByAxes(growByLabels(BASE.radar_chart)), 420, 900)

        case 'scatter_plot':
            // generalmente fijo, pero si hay muchos puntos o labels largos:
            return clamp(BASE.scatter_plot + (n > 12 ? 60 : 0), 420, 680)

        case 'velocimeter':
            // normalmente fijo
            return BASE.velocimeter

        default:
            // fallback seguro
            return 380
    }
})

const chartDomStyle = computed(() => ({
    height: `${dynamicHeight.value}px`,
}))

const hBarLegend = computed(() => {
    const d: any = props.element
    if (d.type !== 'horizontal_bar' || !Array.isArray(d.legend) || d.legend.length === 0) return null

    return d.legend
})

const pieLegendCols = computed(() => {
    if (props.element.type !== 'pie_chart') {
        return { left: [], right: [] } as any
    }

    const d: any = props.element

    const raw = Array.isArray(d.data)
        ? d.data.map((it: any) => ({ name: String(it.label), value: Number(it.value ?? 0) }))
        : (Array.isArray(d.labels) ? d.labels : []).map((l: any, i: number) => ({
            name: String(l),
            value: Number((Array.isArray(d.values) ? d.values : [])[i] ?? 0),
        }))

    const data = raw.filter((x: any) => Number.isFinite(x.value) && x.value > 0)
    const total = data.reduce((acc: number, it: any) => acc + Number(it.value ?? 0), 0)

    const items = data.map((it: any, idx: number) => {
        const pctNum = total > 0 ? (Number(it.value) / total) * 100 : 0
        return {
            name: it.name,
            pct: `${pctNum.toFixed(1)}%`,
            color: DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length],
        }
    })

    const half = Math.ceil(items.length / 2)
    return {
        left: items.slice(0, half),
        right: items.slice(half),
    }
})

const doughnutLegendCols = computed(() => {
    if (props.element.type !== 'doughnut_chart') {
        return { left: [], right: [] } as any
    }

    const d: any = props.element

    const raw = Array.isArray(d.data)
        ? d.data.map((it: any) => ({ name: String(it.label), value: Number(it.value ?? 0) }))
        : (Array.isArray(d.labels) ? d.labels : []).map((l: any, i: number) => ({
            name: String(l),
            value: Number((Array.isArray(d.values) ? d.values : [])[i] ?? 0),
        }))

    const data = raw.filter((x: any) => Number.isFinite(x.value) && x.value > 0)
    const total = data.reduce((acc: number, it: any) => acc + Number(it.value ?? 0), 0)

    const items = data.map((it: any, idx: number) => {
        const pctNum = total > 0 ? (Number(it.value) / total) * 100 : 0
        return {
            name: it.name,
            pct: `${Math.round(pctNum)}%`, // ✅ consistente con tu label inside
            color: DEFAULT_CHART_COLORS[idx % DEFAULT_CHART_COLORS.length],
        }
    })

    const half = Math.ceil(items.length / 2)
    return {
        left: items.slice(0, half),
        right: items.slice(half),
    }
})

/** -------------------------
 *  Rendering lifecycle
 *  ------------------------- */
const canUseWindow = typeof window !== 'undefined'

const renderChart = async () => {
    if (!chartDom.value) return

    // asegura que el DOM aplique el height antes de init()
    await nextTick()

    if (myChart) myChart.dispose()

    myChart = echarts.init(chartDom.value, undefined, { renderer: 'svg' })

    const option = buildChartOption(props.element)

    if (!option) {
        myChart.dispose()
        myChart = null
        chartDom.value.innerHTML =
            '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;">No Data</div>'
        return
    }

    if (!(option as any).color) (option as any).color = DEFAULT_CHART_COLORS
    ;(option as any).animation = false

    myChart.setOption(option as any, true)

    // doble tick para PDF/headless (más estable)
    requestAnimationFrame(() => {
        myChart?.resize()
        requestAnimationFrame(() => myChart?.resize())
    })
}

const handleResize = () => myChart?.resize()

onMounted(() => {
    renderChart()
    if (canUseWindow) window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
    if (canUseWindow) window.removeEventListener('resize', handleResize)
    myChart?.dispose()
})

// re-render cuando cambie data/tipo (deep para cambios internos)
watch(() => props.element, renderChart, { deep: true })
watch(dynamicHeight, () => requestAnimationFrame(() => myChart?.resize()))
</script>

<style scoped>
/* =============================================================================
   CHART BLOCK (wrapper único para TODOS los charts)
============================================================================= */
.chart-block {
    width: 100%;
    margin: 0 auto 24px auto;
    break-inside: avoid;
}

.chart-block--simple {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.chart-block__title {
    font-family: v-bind('theme.FONT_FAMILY');
    font-size: v-bind('theme.CHART_TITLE_2_FONT_SIZE');
    text-align: center;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    margin: 0 0 18px 0;
    color: v-bind('theme.CHART_TITLE_COLOR');
}

/* Charts "simple" que deben verse como una card con borde (ver isCardChart en el script) —
   mismo tratamiento que .panel (radar/pie/doughnut) y que las tablas "Detalle por Dimensión"/
   "Departamentos": borde gris suave + fondo blanco + radio 16px. */
.chart-block--card {
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    border-radius: 16px;
    padding: 24px 28px;
}

/* Mismo tamaño/peso que el título de esas mismas cards (CHART_TITLE_FONT_SIZE/EXTRABOLD) —
   antes usaba CHART_TITLE_2_FONT_SIZE (más chico) y SEMIBOLD, por eso se veía más chico y
   menos "azul" que el resto de los componentes del reporte. */
.chart-block__title--card {
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
}

/* ✅ todos los charts: no más "full width gigante" */
.chart-block__canvas,
.panel__chart {
    width: 100%;
    max-width: 860px;
    margin: 0 auto;
}

.panel__chart--doughnut {
    margin-bottom: 0;
}

.chart-block__canvas { height: 340px; }

.chart-block__canvas--scatter {
    height: 420px;
    margin-top: 18px;
    padding: 6px 70px 12px 10px;
    box-sizing: border-box;
    overflow: visible;
}

/* =============================================================================
   PANEL (tarjeta) - usado por radar/pie/doughnut/velocimeter
============================================================================= */
.panel {
    /* antes theme.SECTION_BG_DEFAULT (tinte de color) — el radar del web tiene fondo
       blanco liso, con borde suave en vez de un tinte para que la tarjeta no se pierda
       contra el fondo blanco de la página (border-slate-200 del web). */
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    padding: 24px 28px;
    /* rounded-2xl del web (16px) — antes 40px, se sentía como un blob, no una card */
    border-radius: 16px;
    break-inside: avoid;
}

.panel__header {
    text-align: center;
    margin: 0 0 10px 0;
}

.panel__header--split {
    text-align: left;
}

.panel__title {
    font-family: v-bind('theme.FONT_FAMILY');
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    line-height: v-bind('theme.LINE_HEIGHT_TITLE');
    color: v-bind('theme.CHART_TITLE_COLOR');
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    letter-spacing: -0.5px;
    text-align: left;
}

.panel__subtitle {
    font-family: v-bind('theme.FONT_FAMILY');
    font-size: v-bind('theme.CHART_SUBTITLE_FONT_SIZE');
    line-height: v-bind('theme.LINE_HEIGHT_SUBTITLE');
    color: v-bind('theme.SECONDARY_700');
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    text-align: left;
}

/* Variantes (solo layout/altura/margins) */
.panel--radar,
.panel--pie,
.panel--doughnut {
    margin: 14px auto 20px auto; /* ✅ auto centra el panel */
    max-width: 980px;            /* opcional: panel no tan ancho */
}

.panel--radar {
    padding-bottom: 44px;
}

.panel--radar { display:flex; flex-direction:column; align-items:center; }

.panel--pie { display:flex; flex-direction:column; align-items:center; }
.panel--doughnut { display:flex; flex-direction:column; align-items:center; }

.panel--velocimeter {
    display:grid;
    grid-template-columns:
    repeat(2, 1fr);
    align-items:center;
}
.panel__side { display:flex; flex-direction:column; justify-content:center; }

/* HORIZONTAL BAR — leyenda de severidad (variant="severity_list") */

.hbar-legend {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-top: 4px;
    padding: 10px 16px;
    background: v-bind('theme.SURFACE_50');
    border-radius: v-bind('theme.RADIUS_FULL');
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
}

.hbar-legend__item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.hbar-legend__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
}

.hbar-legend__label {
    font-family: v-bind('theme.FONT_FAMILY');
    font-size: 13px;
    font-weight: 500;
    color: v-bind('theme.SECONDARY_700');
}

/* PIE */

.pie-legend {
    width: 100%;
    max-width: 860px;
    margin: -8px auto 0 auto;
    padding: 0 24px;
    box-sizing: border-box;

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;

    break-inside: avoid;
}

.pie-legend__col {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.pie-legend__item {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    align-items: start;
    column-gap: 10px;
}

.pie-legend__dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 4px;
}

.pie-legend__label {
    font-family: v-bind('theme.FONT_FAMILY');
    color: v-bind('theme.SECONDARY_700');
    font-size: 13px;
    font-weight: 700;
    line-height: 16px;

    white-space: normal;
    word-break: break-word;
}

.pie-legend__pct {
    font-family: v-bind('theme.FONT_FAMILY');
    color: v-bind('theme.SECONDARY_600');
    font-size: 13px;
    font-weight: 900;
    line-height: 16px;
    text-align: right;
    padding-left: 10px;
    white-space: nowrap;
}

/* DONUT */

.donut-legend {
    width: 100%;
    max-width: 860px;

    /* ✅ antes 14px -> ahora 6px */
    margin: 0 auto 0 auto;

    /* ✅ quita el typo */
    padding: 0 24px 6px 24px;
    box-sizing: border-box;

    display: grid;
    grid-template-columns: 1fr 1fr;

    /* ✅ antes 22px */
    gap: 10px;

    break-inside: avoid;
}

.donut-legend__col {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.donut-legend__item {
    display: grid;
    grid-template-columns: 14px 1fr auto;
    align-items: start;
    column-gap: 10px;
}

.donut-legend__dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    margin-top: 4px;
}

.donut-legend__label {
    font-family: v-bind('theme.FONT_FAMILY');
    color: v-bind('theme.SECONDARY_700');
    font-size: 13px;
    font-weight: 700;
    line-height: 16px;

    white-space: normal;
    word-break: break-word;
}

.donut-legend__pct {
    font-family: v-bind('theme.FONT_FAMILY');
    color: v-bind('theme.SECONDARY_600');
    font-size: 13px;
    font-weight: 900;
    line-height: 16px;
    text-align: right;
    padding-left: 10px;
    white-space: nowrap;
}
</style>
