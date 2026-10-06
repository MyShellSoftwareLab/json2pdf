<template>
    <div class="dst">
        <div v-if="element.title" class="dst__title">{{ element.title }}</div>
        <div v-if="element.subtitle" class="dst__subtitle">{{ element.subtitle }}</div>

        <div class="dst__header">
            <div class="dst__header-cell">Dimensión</div>
            <div class="dst__header-cell">Desempeño</div>
            <div class="dst__header-cell dst__header-cell--right">Score</div>
        </div>

        <div class="dst__rows">
            <div v-for="row in element.rows" :key="row.key" class="dst__row">
                <div class="dst__dim">
                    <div class="dst__badge" :style="{ backgroundColor: dimensionBadgeBg(row.key) }">
                        <img v-if="dimensionIconDataUri(row.key)" class="dst__badge-icon" :src="dimensionIconDataUri(row.key) as string" alt="" />
                    </div>
                    <div class="dst__dim-text">
                        <div class="dst__dim-name">{{ row.name }}</div>
                        <div v-if="row.description" class="dst__dim-desc">{{ row.description }}</div>
                    </div>
                </div>

                <div class="dst__bar">
                    <div class="dst__bar-track">
                        <div
                            v-if="!row.insufficientData"
                            class="dst__bar-fill"
                            :style="{ width: `${barPercent(row)}%`, backgroundColor: severityColor(row.severity) }" />
                    </div>
                    <div
                        v-if="!row.insufficientData"
                        class="dst__bar-handle"
                        :style="{ left: `${barPercent(row)}%`, borderColor: severityColor(row.severity) }" />
                </div>

                <div class="dst__score">
                    <template v-if="row.insufficientData">
                        <div class="dst__score-value dst__score-value--muted">—</div>
                        <div class="dst__score-band">
                            <span class="dst__score-dot" :style="{ backgroundColor: theme.SURFACE_300 }" />
                            Sin datos
                        </div>
                    </template>
                    <template v-else>
                        <div class="dst__score-value" :style="{ color: severityColor(row.severity) }">
                            {{ row.value }}<span class="dst__score-max">/{{ maxScale }}</span>
                        </div>
                        <div class="dst__score-band">
                            <span class="dst__score-dot" :style="{ backgroundColor: severityColor(row.severity) }" />
                            {{ severityLabel(row.severity) }}
                        </div>
                    </template>
                </div>
            </div>
        </div>

        <div v-if="legendItems.length" class="dst__legend">
            <div v-for="item in legendItems" :key="item.label" class="dst__legend-item">
                <span class="dst__legend-dot" :style="{ backgroundColor: item.color }" />
                {{ item.label }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DimensionScoreRow, DimensionScoreTableElement } from '../../types';
import * as theme from '../../theme';
import { dimensionIconDataUri, dimensionBadgeBg } from '../../icons';

const props = defineProps<{
    element: DimensionScoreTableElement;
}>();

const maxScale = computed(() => props.element.max ?? 100);
const barPercent = (row: DimensionScoreRow) => {
    const pct = (row.value / maxScale.value) * 100;
    return Math.max(0, Math.min(100, isFinite(pct) ? pct : 0));
};

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

const severityColor = (severity?: string) => SEVERITY_COLOR[severity ?? ''] ?? theme.SURFACE_300;
const severityLabel = (severity?: string) => SEVERITY_LABEL[severity ?? ''] ?? 'Sin datos';

const legendItems = computed(() => props.element.legend ?? []);
</script>

<style scoped>
/* =============================================================================
   DIMENSION SCORE TABLE — "Detalle por Dimensión": insignia+ícono por dimensión, barra con
   marcador circular + línea punteada de umbral, score coloreado por severidad y eje/leyenda
   compartidos por todas las filas (ver DimensionScoreTableElement en types.ts).
============================================================================= */
.dst {
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    border-radius: 16px;
    padding: 28px 32px;
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    break-inside: avoid;
}

.dst__title {
    text-align: center;
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    color: v-bind('theme.CHART_TITLE_COLOR');
    letter-spacing: -0.5px;
}

.dst__subtitle {
    text-align: center;
    font-size: 15px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    margin-top: 4px;
    margin-bottom: 20px;
}

/* Grid compartido: DIMENSIÓN / DESEMPEÑO / SCORE — mismas 3 columnas en header y cada fila,
   así la barra queda perfectamente alineada entre todas ellas. */
.dst__header,
.dst__row {
    display: grid;
    grid-template-columns: 260px 1fr 110px;
    align-items: center;
    gap: 24px;
}

.dst__header {
    background: v-bind('theme.SECONDARY_500');
    color: v-bind('theme.SURFACE_0');
    border-radius: 12px;
    padding: 12px 20px;
    margin-bottom: 4px;
}

.dst__header-cell {
    font-size: 11px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.dst__header-cell--right {
    text-align: right;
}

.dst__row {
    padding: 16px 20px;
    border-bottom: 1px solid v-bind('theme.SURFACE_100');
}

.dst__rows .dst__row:last-child {
    border-bottom: none;
}

.dst__dim {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
}

.dst__badge {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.dst__badge-icon {
    width: 20px;
    height: 20px;
}

.dst__dim-text {
    min-width: 0;
}

.dst__dim-name {
    font-size: 15px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    color: v-bind('theme.SURFACE_950');
    line-height: 1.25;
}

.dst__dim-desc {
    font-size: 12px;
    font-weight: v-bind('theme.FONT_WEIGHT_REGULAR');
    color: v-bind('theme.SURFACE_400');
    margin-top: 1px;
}

/* Barra: track gris + relleno coloreado + marcador circular — todo posicionado por %
   sobre el mismo contenedor relative. */
.dst__bar {
    position: relative;
    height: 22px;
    display: flex;
    align-items: center;
}

.dst__bar-track {
    width: 100%;
    height: 10px;
    border-radius: v-bind('theme.RADIUS_FULL');
    background: v-bind('theme.SURFACE_100');
    overflow: hidden;
}

.dst__bar-fill {
    height: 100%;
    border-radius: v-bind('theme.RADIUS_FULL');
}

.dst__bar-handle {
    position: absolute;
    top: 50%;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: v-bind('theme.SURFACE_0');
    border: 3px solid;
    transform: translate(-50%, -50%);
}

.dst__score {
    text-align: right;
}

.dst__score-value {
    font-size: 22px;
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    line-height: 1.1;
}

.dst__score-value--muted {
    color: v-bind('theme.SURFACE_300');
}

.dst__score-max {
    font-size: 13px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
}

.dst__score-band {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 5px;
    font-size: 11px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
    margin-top: 2px;
}

.dst__score-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.dst__legend {
    display: flex;
    justify-content: center;
    gap: 28px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid v-bind('theme.SURFACE_100');
}

.dst__legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
}

.dst__legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
}
</style>
