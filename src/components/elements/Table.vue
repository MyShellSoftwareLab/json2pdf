<template>
    <div class="el-table" :class="{ 'el-table--dense': isDense, 'el-table--custom-widths': columnWidths }">
        <div v-if="element.title" class="el-block-title">{{ element.title }}</div>

        <table class="el-table__table">
            <colgroup v-if="columnWidths">
                <col v-for="(width, w) in columnWidths" :key="w" :style="{ width }" />
            </colgroup>
            <thead>
                <tr>
                    <th v-for="(header, h) in element.headers" :key="h"><RichText :content="header" /></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, r) in element.rows" :key="r">
                    <td v-for="(cell, c) in row" :key="c" :style="cellBackground(cell)"><RichText :content="(cell as any)" /></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { TableElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

const props = defineProps<{
    element: TableElement;
}>();

// Con muchas columnas (ej. departamentos x 8 dimensiones) el padding/tipografía por defecto
// (pensados para tablas de 2-3 columnas) hacen que la tabla no quepa en el ancho de una hoja
// A4 en retrato — se reduce el espaciado/tamaño de fuente solo para estos casos.
const isDense = computed(() => (props.element.headers?.length || 0) > 6);

// Anchos explícitos por columna (ver TableElement.column_widths). Con table-layout:fixed el
// <colgroup> manda sobre el reparto en partes iguales; un número son píxeles, igual que las
// longitudes de `options`.
const columnWidths = computed(() => {
    const widths = props.element.column_widths;
    if (!widths?.length) return null;

    return widths.map(width => (typeof width === 'number' ? `${width}px` : width.trim()));
});

// Heatmap de celda completa (ver RichText.vue: isCellFill) — el color de fondo lo decide el
// <td> real, no un wrapper interno, para que pinte la celda completa (padding incluido) sin
// depender de márgenes negativos ni de que el contenido llene el 100% del alto/ancho.
const HEATMAP_BG: Record<string, string> = {
    success: theme.HEATMAP_SUCCESS_BG,
    warning: theme.HEATMAP_WARNING_BG,
    danger: theme.HEATMAP_ERROR_BG,
    error: theme.HEATMAP_ERROR_BG,
};

function cellBackground(cell: unknown) {
    if (cell && typeof cell === 'object' && (cell as any).cellFill && (cell as any).severity) {
        const bg = HEATMAP_BG[(cell as any).severity as string];
        if (bg) return { backgroundColor: bg };
    }

    return {};
}
</script>

<style scoped>
/* =============================================================================
   BLOCK TITLE (para secciones internas como Table title)
   - Reemplaza el viejo "chart-title" dentro de tabla
============================================================================= */
.el-block-title {
    text-align: center;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    margin: 0 0 10px 0;
    font-size: 16px;
    color: v-bind('theme.CHART_TITLE_COLOR');
}

/* =============================================================================
TABLE — estilo como la imagen (sin cambiar markup ni data)
============================================================================= */
.el-table {
    width: 100%;
    break-inside: avoid;
}

/* Si usas title arriba, que respire */
.el-table .el-block-title {
    font-size: 24px;
}

/* Tabla base */
.el-table__table {
    width: 100%;
    /* fixed: las columnas se reparten el 100% del ancho disponible y el texto se ajusta
       adentro — sin esto, una tabla con muchas columnas (ej. departamentos x 8 dimensiones)
       se sale de la hoja porque el layout `auto` respeta el ancho mínimo de contenido de
       cada columna en vez de comprimirlas. */
    table-layout: fixed;
    border-collapse: separate;
    /* clave para border-radius por celdas */
    border-spacing: 0;
    /* sin huecos raros */
    color: v-bind('theme.TEXT_PRIMARY');
}

/* La primera columna (etiqueta/nombre) necesita más espacio que el resto — sin esto,
   table-layout:fixed reparte el ancho en partes iguales entre todas las columnas. */
/* Con column_widths el <colgroup> decide todos los anchos — este 22% competiría con él. */
.el-table:not(.el-table--custom-widths) .el-table__table th:first-child,
.el-table:not(.el-table--custom-widths) .el-table__table td:first-child {
    width: 22%;
}

/* Quita bordes “tabla tradicional” */
.el-table__table th,
.el-table__table td {
    border: none;
    padding: 18px 18px;
    vertical-align: top;
    overflow-wrap: break-word;
}

/* Tablas con muchas columnas (ver isDense en el script) — espaciado/tipografía más
   compactos para que el contenido siga siendo legible sin salirse de la hoja. */
.el-table--dense .el-table__table th,
.el-table--dense .el-table__table td {
    padding: 8px 6px;
}

.el-table--dense .el-table__table thead th {
    font-size: 11px;
}

.el-table--dense .el-table__table tbody td:first-child {
    font-size: 11px;
    padding: 8px 4px;
}

.el-table--dense .el-table__table tbody td:nth-child(n + 2) {
    font-size: 11px;
}

/* ----------------------------- HEADER “pastilla” ------------------------------ */
.el-table__table thead th {
    /* Mismo color que la píldora de la columna 1, para que header y primera columna se
       vean como el mismo sistema. */
    background: v-bind('theme.SECONDARY_500');
    color: v-bind('theme.SURFACE_0');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    font-size: 18px;
    line-height: 1.1;
    letter-spacing: -0.01em;
    text-align: left;
    /* separadores blancos suaves */
    border-right: 2px solid rgba(255, 255, 255, 0.55);
}

.el-table__table thead th:last-child {
    border-right: none;
}

/* Redondeo de la “pastilla” del header */
.el-table__table thead th:first-child {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
}

.el-table__table thead th:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
}

/* Separación visual entre header y body */
.el-table__table thead tr th {
    /* simula el gap del ejemplo */
    box-shadow: 0 10px 0 rgba(0, 0, 0, 0);
    /* no visible, mantiene consistencia en render PDF */
}

.el-table__table tbody::before {
    content: "";
    display: block;
    height: 16px;
    /* gap */
}

/* ----------------------------- BODY ------------------------------ */
/* Columna 1: “pastilla” oscura (fondo propio, no el de las demás celdas) */
.el-table__table tbody td:first-child {
    background: v-bind('theme.SECONDARY_500');
    color: v-bind('theme.SURFACE_0');
    font-style: italic;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    font-size: 14px;
    text-align: left;
    vertical-align: middle;
    padding: 12px 14px;
}

/* Resto de columnas (score/barra de progreso, etc.): sin tinte de color — antes tenían un
   fondo verde suave (theme.PRIMARY_50); ahora blanco liso con un borde gris fino. */
.el-table__table tbody td:nth-child(n + 2) {
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    background-clip: padding-box;
    color: v-bind('theme.SECONDARY_800');
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    font-size: 14px;
    line-height: 1.2;
    /* Cuando la columna 1 envuelve a 2-3 líneas la fila crece — sin esto la barra de
       progreso se queda pegada arriba (hereda vertical-align:top de la regla base) en vez
       de centrada con el alto real de la fila. */
    vertical-align: middle;
}

/* Solo el lado izquierdo (el borde exterior real de la tabla) — el derecho se quitó porque
   quedaba un radio "sobrando" contra la esquina cuadrada de la columna 2, que no tiene
   radio de su lado izquierdo (son celdas contiguas, no una sola pastilla). */
.el-table__table tbody tr:first-child td:first-child {
    border-top-left-radius: 18px;
}

.el-table__table tbody tr:last-child td:first-child {
    border-bottom-left-radius: 18px;
}

/* Mismo radio (18px) en la esquina exterior de la última columna, para que el bloque
   completo (píldora oscura + celdas con borde) se vea como una sola tarjeta redondeada. */
.el-table__table tbody tr:first-child td:last-child {
    border-top-right-radius: 18px;
}

.el-table__table tbody tr:last-child td:last-child {
    border-bottom-right-radius: 18px;
}
</style>
