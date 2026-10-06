<template>
    <div class="fsec">
        <div class="fsec__heading">
            <span class="fsec__bar" />
            <div>
                <div v-if="element.title" class="fsec__title">{{ element.title }}</div>
                <div v-if="element.subtitle" class="fsec__subtitle">{{ element.subtitle }}</div>
            </div>
        </div>

        <div class="fsec__grid">
            <div
                v-for="(card, i) in element.cards" :key="i"
                class="fsec__card"
                :style="{ backgroundColor: hexToRgba(severityColor(card.severity), 0.06), borderColor: hexToRgba(severityColor(card.severity), 0.35) }">
                <div class="fsec__left">
                    <div class="fsec__icon-circle" :style="{ backgroundColor: hexToRgba(severityColor(card.severity), 0.14) }">{{ card.icon }}</div>
                    <div class="fsec__number" :style="{ color: severityColor(card.severity) }">
                        {{ card.leadNumber }}<span v-if="card.leadUnit">{{ card.leadUnit }}</span>
                    </div>
                    <div class="fsec__title-rest"><RichText :content="card.titleRest" /></div>
                </div>

                <div class="fsec__divider" :style="{ backgroundColor: hexToRgba(severityColor(card.severity), 0.25) }" />

                <div class="fsec__right">
                    <div class="fsec__impact-label" :style="{ color: severityColor(card.severity) }">Impacto</div>
                    <div class="fsec__impact-text">{{ card.impact }}</div>
                    <div v-if="card.action" class="fsec__action" :style="{ backgroundColor: hexToRgba(severityColor(card.severity), 0.12), color: severityColor(card.severity) }">
                        <span class="fsec__action-arrow">→</span> {{ card.action }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { FindingsSectionElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

defineProps<{
    element: FindingsSectionElement;
}>();

const SEVERITY_COLOR: Record<string, string> = {
    critical: theme.CHART_ERROR,
    high: theme.CHART_WARNING,
    medium: theme.PRIMARY_600,
};

const severityColor = (severity: string) => SEVERITY_COLOR[severity] ?? theme.SURFACE_400;

const hexToRgba = (hex: string, alpha: number) => {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
</script>

<style scoped>
/* =============================================================================
   FINDINGS SECTION — "Hallazgos Principales": card por finding, mitad izquierda (ícono +
   número destacado + título) / mitad derecha ("Impacto" + acción recomendada).
============================================================================= */
.fsec {
    break-inside: avoid;
}

.fsec__heading {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
}

.fsec__bar {
    width: 5px;
    height: 30px;
    border-radius: v-bind('theme.RADIUS_SM');
    background: v-bind('theme.PRIMARY_500');
    flex-shrink: 0;
    margin-top: 4px;
}

.fsec__title {
    font-size: v-bind('theme.CHART_TITLE_FONT_SIZE');
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    color: v-bind('theme.CHART_TITLE_COLOR');
    letter-spacing: -0.5px;
    line-height: 1.15;
}

.fsec__subtitle {
    font-size: 14px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_400');
    margin-top: 2px;
}

.fsec__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.fsec__card {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 18px;
    border: 1px solid;
    border-radius: 14px;
    padding: 20px;
    break-inside: avoid;
}

.fsec__left {
    min-width: 0;
}

.fsec__icon-circle {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    margin-bottom: 10px;
}

.fsec__number {
    font-size: 34px;
    font-weight: v-bind('theme.FONT_WEIGHT_EXTRABOLD');
    line-height: 1;
}

.fsec__title-rest {
    font-size: 13px;
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    color: v-bind('theme.SURFACE_950');
    margin-top: 4px;
    line-height: 1.35;
}

.fsec__divider {
    width: 1px;
}

.fsec__right {
    min-width: 0;
    padding-top: 2px;
}

.fsec__impact-label {
    font-size: 13px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    margin-bottom: 4px;
}

.fsec__impact-text {
    font-size: 12.5px;
    color: v-bind('theme.SURFACE_500');
    line-height: 1.4;
    margin-bottom: 14px;
}

.fsec__action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11.5px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    padding: 8px 12px;
    border-radius: 8px;
    line-height: 1.3;
}

.fsec__action-arrow {
    flex-shrink: 0;
}
</style>
