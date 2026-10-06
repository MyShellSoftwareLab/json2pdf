<template>
    <div class="idg">
        <div v-if="element.title" class="idg__title">{{ element.title }}</div>
        <div v-if="element.subtitle" class="idg__subtitle">{{ element.subtitle }}</div>

        <div class="idg__grid" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
            <div v-for="card in element.cards" :key="card.key" class="idg__card">
                <div class="idg__card-header">
                    <div class="idg__badge" :style="{ backgroundColor: dimensionBadgeBg(card.key) }">
                        <img v-if="dimensionIconDataUri(card.key)" class="idg__badge-icon" :src="dimensionIconDataUri(card.key) as string" alt="" />
                    </div>
                    <div class="idg__card-name">{{ card.name }}</div>
                    <div class="idg__card-score">
                        <div class="idg__card-score-value" :style="{ color: severityColor(card.severity) }">
                            {{ card.score }}<span class="idg__card-score-max">/{{ maxScale }}</span>
                        </div>
                        <div class="idg__card-score-band">
                            <span class="idg__card-score-dot" :style="{ backgroundColor: severityColor(card.severity) }" />
                            {{ severityLabel(card.severity) }}
                        </div>
                    </div>
                </div>

                <div v-if="card.description" class="idg__card-desc">{{ card.description }}</div>

                <div v-if="card.indicators.length" class="idg__indicators">
                    <div class="idg__indicators-label">Indicadores</div>
                    <div v-for="ind in card.indicators" :key="ind.name" class="idg__indicator-row">
                        <div class="idg__indicator-name">{{ ind.name }}</div>
                        <div class="idg__indicator-bar">
                            <div class="idg__indicator-track">
                                <div
                                    class="idg__indicator-fill"
                                    :style="{ width: `${barPercent(ind)}%`, backgroundColor: severityColor(ind.severity) }" />
                            </div>
                            <span class="idg__indicator-value">
                                {{ ind.value }}<span class="idg__indicator-max">/{{ maxScale }}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="idg__footer">
            <div v-if="legendItems.length" class="idg__legend">
                <div v-for="item in legendItems" :key="item.label" class="idg__legend-item">
                    <span class="idg__legend-dot" :style="{ backgroundColor: item.color }" />
                    {{ item.label }}
                </div>
            </div>

            <div class="idg__scale">
                <div class="idg__scale-bar" />
                <div class="idg__scale-marker" :style="{ left: `${threshold}%` }" />
                <div class="idg__scale-labels">
                    <span class="idg__scale-label idg__scale-label--start">0</span>
                    <span class="idg__scale-label idg__scale-label--marker" :style="{ left: `${threshold}%` }">{{ threshold }}</span>
                    <span class="idg__scale-label idg__scale-label--end">100</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IndicatorDimensionGridElement, IndicatorRow } from '../../types';
import * as theme from '../../theme';
import { dimensionIconDataUri, dimensionBadgeBg } from '../../icons';

const props = defineProps<{
    element: IndicatorDimensionGridElement;
}>();

const maxScale = computed(() => props.element.max ?? 100);
const columns = computed(() => props.element.columns ?? 2);
const threshold = 70;

const barPercent = (row: IndicatorRow) => {
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
   INDICATOR DIMENSION GRID — "Indicadores por Dimensión": una card por dimensión (ícono +
   nombre + score + descripción) con sus indicadores como mini-barras, en una grilla de N
   columnas (ver `columns` en IndicatorDimensionGridElement, types.ts).
============================================================================= */
.idg {
    break-inside: avoid;
}

.idg__title {
    text-align: center;
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    color: v-bind('theme.CHART_TITLE_COLOR');
    letter-spacing: -0.5px;
}

.idg__subtitle {
    text-align: center;
    font-size: 15px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    margin-top: 4px;
    margin-bottom: 20px;
}

.idg__grid {
    display: grid;
    gap: 16px;
}

.idg__card {
    background: v-bind('theme.SURFACE_0');
    border: 1px solid v-bind('theme.SURFACE_200');
    border-radius: 14px;
    padding: 18px 20px;
    break-inside: avoid;
}

.idg__card-header {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.idg__badge {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.idg__badge-icon {
    width: 17px;
    height: 17px;
}

.idg__card-name {
    flex: 1;
    min-width: 0;
    font-size: 14.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    color: v-bind('theme.SURFACE_950');
    line-height: 1.25;
    padding-top: 2px;
}

.idg__card-score {
    flex-shrink: 0;
    text-align: right;
}

.idg__card-score-value {
    font-size: 19px;
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    line-height: 1.1;
}

.idg__card-score-max {
    font-size: 11px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
}

.idg__card-score-band {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
    font-size: 10px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
    margin-top: 1px;
}

.idg__card-score-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
}

.idg__card-desc {
    font-size: 11.5px;
    color: v-bind('theme.SURFACE_400');
    margin-top: 4px;
}

.idg__indicators {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid v-bind('theme.SURFACE_100');
}

.idg__indicators-label {
    font-size: 10px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: v-bind('theme.SURFACE_400');
    margin-bottom: 10px;
}

.idg__indicator-row {
    margin-bottom: 10px;
}

.idg__indicator-row:last-child {
    margin-bottom: 0;
}

.idg__indicator-name {
    font-size: 12px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_950');
    margin-bottom: 4px;
}

.idg__indicator-bar {
    display: flex;
    align-items: center;
    gap: 8px;
}

.idg__indicator-track {
    flex: 1;
    height: 6px;
    border-radius: v-bind('theme.RADIUS_FULL');
    background: v-bind('theme.SURFACE_100');
    overflow: hidden;
}

.idg__indicator-fill {
    height: 100%;
    border-radius: v-bind('theme.RADIUS_FULL');
}

.idg__indicator-value {
    flex-shrink: 0;
    font-size: 10.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
    white-space: nowrap;
}

.idg__indicator-max {
    color: v-bind('theme.SURFACE_300');
}

/* ----------------------------- FOOTER: leyenda + escala ------------------------------ */
.idg__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    margin-top: 20px;
    padding-top: 14px;
}

.idg__legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.idg__legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: v-bind('theme.FONT_WEIGHT_SEMIBOLD');
    color: v-bind('theme.SURFACE_500');
    white-space: nowrap;
}

.idg__legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
}

.idg__scale {
    position: relative;
    width: 220px;
    flex-shrink: 0;
    padding-top: 4px;
}

.idg__scale-bar {
    height: 6px;
    border-radius: v-bind('theme.RADIUS_FULL');
    background: linear-gradient(to right, v-bind('theme.CHART_ERROR'), v-bind('theme.CHART_WARNING'), v-bind('theme.CHART_SUCCESS'));
}

.idg__scale-marker {
    position: absolute;
    top: 0;
    width: 2px;
    height: 6px;
    background: v-bind('theme.SURFACE_950');
    transform: translateX(-50%);
}

.idg__scale-labels {
    position: relative;
    height: 14px;
    margin-top: 4px;
}

.idg__scale-label {
    position: absolute;
    top: 0;
    font-size: 10px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    white-space: nowrap;
}

.idg__scale-label--start {
    left: 0;
}

.idg__scale-label--end {
    right: 0;
}

.idg__scale-label--marker {
    transform: translateX(-50%);
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    color: v-bind('theme.PRIMARY_600');
}
</style>
