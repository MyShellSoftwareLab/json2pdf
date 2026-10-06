<template>
    <div class="deptbl">
        <div v-if="element.title" class="deptbl__title">{{ element.title }}</div>
        <div v-if="element.subtitle" class="deptbl__subtitle">{{ element.subtitle }}</div>

        <table class="deptbl__table" lang="es">
            <colgroup>
                <col style="width: 19%" />
                <col style="width: 8%" />
                <col style="width: 9%" />
                <col v-for="col in element.dimensionColumns" :key="col.key" :style="{ width: `${dimensionColWidth}%` }" />
            </colgroup>
            <thead>
                <tr>
                    <th class="deptbl__th deptbl__th--dept">Departamento</th>
                    <th class="deptbl__th">
                        <img v-if="peopleIconDataUri('#CBD5E1')" class="deptbl__th-icon" :src="peopleIconDataUri('#CBD5E1') as string" alt="" />
                        <span>Personas</span>
                    </th>
                    <th class="deptbl__th">
                        <span>{{ element.scoreLabel ?? 'Score' }}</span>
                        <span class="deptbl__th-sub">/100</span>
                    </th>
                    <th v-for="col in element.dimensionColumns" :key="col.key" class="deptbl__th">
                        <img v-if="dimensionIconDataUri(col.key)" class="deptbl__th-icon" :src="dimensionIconDataUri(col.key) as string" alt="" />
                        <span>{{ col.label }}</span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="row in element.rows" :key="row.name">
                    <td class="deptbl__td deptbl__td--dept">
                        <div class="deptbl__dept-cell">
                            <div class="deptbl__dept-badge">
                                <img v-if="departmentIconMonoDataUri(row.iconKey, theme.PRIMARY_600)" class="deptbl__dept-icon" :src="departmentIconMonoDataUri(row.iconKey, theme.PRIMARY_600) as string" alt="" />
                            </div>
                            <span class="deptbl__dept-name">{{ row.name }}</span>
                        </div>
                    </td>
                    <td class="deptbl__td deptbl__td--center">{{ row.headcount }}</td>
                    <td class="deptbl__td deptbl__td--score">
                        <template v-if="row.insufficientData">
                            <div class="deptbl__score-value deptbl__score-value--muted">Datos insuficientes</div>
                            <div class="deptbl__score-band">
                                <span class="deptbl__score-dot" :style="{ backgroundColor: theme.SURFACE_300 }" />
                                Sin datos
                            </div>
                        </template>
                        <template v-else>
                            <div class="deptbl__score-value" :style="{ color: severityColor(row.scoreSeverity) }">{{ row.score }}</div>
                            <div class="deptbl__score-band">
                                <span class="deptbl__score-dot" :style="{ backgroundColor: severityColor(row.scoreSeverity) }" />
                                {{ severityLabel(row.scoreSeverity) }}
                            </div>
                        </template>
                    </td>
                    <td
                        v-for="(cell, i) in row.cells" :key="i"
                        class="deptbl__td deptbl__td--cell"
                        :style="cellStyle(cell)">
                        <span v-if="cell.value !== null">{{ cell.value }}</span>
                        <span v-else class="deptbl__td-empty">—</span>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="deptbl__footer">
            <div v-if="legendItems.length" class="deptbl__legend">
                <div v-for="item in legendItems" :key="item.label" class="deptbl__legend-item">
                    <span class="deptbl__legend-dot" :style="{ backgroundColor: item.color }" />
                    {{ item.label }}
                </div>
            </div>

            <div class="deptbl__scale">
                <div class="deptbl__scale-bar" />
                <div class="deptbl__scale-marker" :style="{ left: `${thresholdPercent}%` }" />
                <div class="deptbl__scale-labels">
                    <span class="deptbl__scale-label deptbl__scale-label--start">0</span>
                    <span class="deptbl__scale-label deptbl__scale-label--marker" :style="{ left: `${thresholdPercent}%` }">{{ threshold }}</span>
                    <span class="deptbl__scale-label deptbl__scale-label--end">100</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DepartmentTableCell, DepartmentTableElement } from '../../types';
import * as theme from '../../theme';
import { dimensionIconDataUri, departmentIconMonoDataUri, peopleIconDataUri } from '../../icons';

const props = defineProps<{
    element: DepartmentTableElement;
}>();

const threshold = computed(() => props.element.threshold ?? 70);
const thresholdPercent = computed(() => threshold.value);

// Ancho explícito por columna de dimensión (en vez de dejar el <col> sin width) — con
// table-layout:fixed, un <col> sin width debería repartirse el espacio restante en partes
// iguales, pero en el render de Puppeteer la última columna terminaba desbordando la card en
// vez de encogerse, así que se calcula el % exacto acá en vez de confiar en el default del
// navegador.
const FIXED_COLS_WIDTH = 19 + 8 + 9;
const dimensionColWidth = computed(() => {
    const count = props.element.dimensionColumns.length || 1;
    return (100 - FIXED_COLS_WIDTH) / count;
});

const SEVERITY_COLOR: Record<string, string> = {
    success: theme.CHART_SUCCESS,
    warning: theme.CHART_WARNING,
    error: theme.CHART_ERROR,
};

const SEVERITY_LABEL: Record<string, string> = {
    success: 'Fortaleza',
    warning: 'En desarrollo',
    error: 'En riesgo',
};

const HEATMAP_BG: Record<string, string> = {
    success: theme.HEATMAP_SUCCESS_BG,
    warning: theme.HEATMAP_WARNING_BG,
    error: theme.HEATMAP_ERROR_BG,
};

const HEATMAP_TEXT: Record<string, string> = {
    success: theme.HEATMAP_SUCCESS_TEXT,
    warning: theme.HEATMAP_WARNING_TEXT,
    error: theme.HEATMAP_ERROR_TEXT,
};

const severityColor = (severity?: string) => SEVERITY_COLOR[severity ?? ''] ?? theme.SURFACE_300;
const severityLabel = (severity?: string) => SEVERITY_LABEL[severity ?? ''] ?? 'Sin datos';

const cellStyle = (cell: DepartmentTableCell) => {
    if (cell.value === null || !cell.severity) return {};
    return {
        backgroundColor: HEATMAP_BG[cell.severity] ?? '',
        color: HEATMAP_TEXT[cell.severity] ?? '',
    };
};

const legendItems = computed(() => props.element.legend ?? []);
</script>

<style scoped>
/* =============================================================================
   DEPARTMENT TABLE — "Departamentos": comparativo por departamento x dimensión, con
   insignia+ícono por departamento, score coloreado+etiqueta de severidad, celdas con heatmap
   completo por dimensión, y una barra de escala + leyenda compartidas al pie (ver
   DepartmentTableElement en types.ts).
============================================================================= */
.deptbl {
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    border-radius: 16px;
    padding: 24px 28px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    break-inside: avoid;
}

.deptbl__title {
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    color: v-bind('theme.CHART_TITLE_COLOR');
    letter-spacing: -0.5px;
}

.deptbl__subtitle {
    font-size: 15px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    margin-top: 2px;
    margin-bottom: 18px;
}

.deptbl__table {
    width: 100%;
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0;
}

/* ----------------------------- HEADER ------------------------------ */
.deptbl__th {
    background: v-bind('theme.SECONDARY_500');
    color: v-bind('theme.SURFACE_0');
    font-size: 10px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    line-height: 1.25;
    text-align: center;
    vertical-align: middle;
    padding: 10px 4px;
    /* Sin esto, una etiqueta de una sola palabra más ancha que la columna (ej.
       "Habilidades") no tiene ningún espacio donde envolver — en vez de partirse a una
       segunda línea, se desborda por fuera de la columna (y de la card, si es la última).
       hyphens:auto (con lang="es" en la <table>) parte por sílaba real en vez de a la mitad;
       overflow-wrap sigue de respaldo si el navegador no tiene diccionario de guionizado. */
    hyphens: auto;
    overflow-wrap: break-word;
}

.deptbl__th--dept {
    text-align: left;
    padding-left: 14px;
    font-size: 11px;
}

.deptbl__th:first-child {
    border-radius: 10px 0 0 10px;
}

.deptbl__th:last-child {
    border-radius: 0 10px 10px 0;
}

.deptbl__th-icon {
    display: block;
    width: 15px;
    height: 15px;
    margin: 0 auto 3px;
}

.deptbl__th-sub {
    display: block;
    font-size: 9px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_300');
}

/* ----------------------------- BODY ------------------------------ */
.deptbl__td {
    padding: 10px 6px;
    text-align: center;
    vertical-align: middle;
    font-size: 12px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_950');
    border-bottom: 1px solid v-bind('theme.SURFACE_100');
}

.deptbl__table tbody tr:last-child .deptbl__td {
    border-bottom: none;
}

.deptbl__td--dept {
    text-align: left;
    padding-left: 14px;
}

.deptbl__td--center {
    color: v-bind('theme.SURFACE_500');
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
}

.deptbl__dept-cell {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
}

.deptbl__dept-badge {
    width: 26px;
    height: 26px;
    border-radius: 7px;
    background: v-bind('theme.PRIMARY_50');
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.deptbl__dept-icon {
    width: 14px;
    height: 14px;
}

.deptbl__dept-name {
    font-size: 12.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    /* Nunca truncar con "..." — es un reporte, no una lista de UI; un nombre de departamento
       largo debe envolver a una segunda línea en vez de perder texto. flex+min-width:0 para
       que efectivamente se achique/envuelva dentro de .deptbl__dept-cell en vez de forzar el
       ancho de la fila (default de un hijo flex es no encogerse bajo su contenido). */
    flex: 1;
    min-width: 0;
    overflow-wrap: break-word;
    line-height: 1.2;
}

.deptbl__score-value {
    font-size: 17px;
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    line-height: 1.15;
}

.deptbl__score-value--muted {
    font-size: 10.5px;
    color: v-bind('theme.SURFACE_400');
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
}

.deptbl__score-band {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    font-size: 9.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
    margin-top: 2px;
}

.deptbl__score-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.deptbl__td-empty {
    color: v-bind('theme.SURFACE_300');
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
}

/* ----------------------------- FOOTER: leyenda + escala ------------------------------ */
.deptbl__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid v-bind('theme.SURFACE_100');
}

.deptbl__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.deptbl__legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
    white-space: nowrap;
}

.deptbl__legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.deptbl__scale {
    position: relative;
    width: 220px;
    flex-shrink: 0;
    padding-top: 4px;
}

.deptbl__scale-bar {
    height: 6px;
    border-radius: v-bind('theme.RADIUS_FULL');
    background: linear-gradient(to right, v-bind('theme.CHART_ERROR'), v-bind('theme.CHART_WARNING'), v-bind('theme.CHART_SUCCESS'));
}

.deptbl__scale-marker {
    position: absolute;
    top: 0;
    width: 2px;
    height: 6px;
    background: v-bind('theme.SURFACE_950');
    transform: translateX(-50%);
}

.deptbl__scale-labels {
    position: relative;
    height: 14px;
    margin-top: 4px;
}

.deptbl__scale-label {
    position: absolute;
    top: 0;
    font-size: 10px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    white-space: nowrap;
}

.deptbl__scale-label--start {
    left: 0;
}

.deptbl__scale-label--end {
    right: 0;
}

.deptbl__scale-label--marker {
    transform: translateX(-50%);
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    color: v-bind('theme.PRIMARY_600');
}
</style>
