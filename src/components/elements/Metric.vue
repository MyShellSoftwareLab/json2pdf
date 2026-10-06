<template>
    <!-- Variante "hero" (tarjeta oscura destacada): número grande + badge +
         stats laterales. Se activa con `subStats` — sin él, es la tarjeta simple de siempre. -->
    <div v-if="isHero" class="metric-hero">
        <div class="metric-hero__left">
            <span class="metric-hero__value">{{ element.value }}</span>
            <span v-if="element.max !== undefined" class="metric-hero__max">/ {{ element.max }}</span>
            <span v-if="element.badge" class="metric-hero__badge">{{ element.badge }}</span>
        </div>
        <div class="metric-hero__stats">
            <div v-for="(stat, i) in element.subStats" :key="i" class="metric-hero__stat">
                <div class="metric-hero__stat-value" :class="{ 'metric-hero__stat-value--danger': stat.color === 'danger' }">
                    {{ stat.value }}
                </div>
                <div class="metric-hero__stat-label">{{ stat.label }}</div>
            </div>
        </div>
    </div>

    <div v-else class="metric" :style="getMetricStyle(element)">
        <div class="metric__title" :class="{ 'metric__title--onColor': (!!element.severity && element.severity != 'info') }">
            {{ element.title || (element as any).label }}
        </div>
        <div class="metric__value" :class="{ 'metric__value--onColor': (!!element.severity && element.severity != 'info') }">
            <RichText :content="element.value" />
        </div>
        <div v-if="element.interpretation" class="metric__hint"
            :class="{ 'metric__hint--onColor': (!!element.severity && element.severity != 'info') }">
            {{ element.interpretation }}
        </div>
    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { MetricElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

const props = defineProps<{
    element: MetricElement;
}>();

const isHero = computed(() => !!(props.element.subStats && props.element.subStats.length));

const getMetricStyle = (element: MetricElement) => {
    if (element.severity && element.severity != 'info') {
        let bgColor = theme.PRIMARY_50;
        const txtColor = '#ffffff';
        if (element.severity === 'success') {
            bgColor = theme.ACCENT_SUCCESS;
        } else if (element.severity === 'danger' || element.severity === 'error') {
            bgColor = theme.ACCENT_ERROR;
        } else if (element.severity === 'warning') {
            bgColor = theme.ACCENT_WARNING;
        }
        return {
            backgroundColor: bgColor,
            borderColor: bgColor,
            color: txtColor
        };
    }
    return {};
};
</script>

<style scoped>
/* =============================================================================
   METRIC HERO — tarjeta oscura destacada. Colores/gradiente en theme.HERO_*.
============================================================================= */
.metric-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(to right, v-bind('theme.HERO_GRADIENT_START'), v-bind('theme.HERO_GRADIENT_END'));
    border-radius: 16px;
    padding: 32px;
    margin: 0 0 20px 0;
    break-inside: avoid;
}

.metric-hero__left {
    display: flex;
    align-items: baseline;
    gap: 4px;
}

.metric-hero__value {
    font-size: 72px;
    font-weight: 900;
    letter-spacing: -0.05em;
    line-height: 1;
    color: v-bind('theme.SURFACE_0');
}

.metric-hero__max {
    font-size: 20px;
    font-weight: 700;
    color: v-bind('theme.HERO_MUTED');
}

.metric-hero__badge {
    font-size: 10px;
    font-weight: 700;
    color: v-bind('theme.PRIMARY_400');
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-left: 8px;
}

.metric-hero__stats {
    display: flex;
    gap: 48px;
}

.metric-hero__stat {
    text-align: center;
}

.metric-hero__stat-value {
    font-size: 30px;
    font-weight: 900;
    line-height: 1;
    color: v-bind('theme.SURFACE_0');
}

.metric-hero__stat-value--danger {
    color: v-bind('theme.HERO_DANGER');
}

.metric-hero__stat-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: v-bind('theme.HERO_MUTED');
    margin-top: 4px;
}

/* =============================================================================
   METRIC (tarjeta simple)
============================================================================= */
.metric {
    border: 1px solid v-bind('theme.SURFACE_200');
    background-color: v-bind('theme.PRIMARY_50');
    padding: 20px;
    /* rounded-2xl del web (16px) — antes 8px, se sentía más chip que card */
    border-radius: 16px;
    margin: 0 0 20px 0;
    text-align: center;
    break-inside: avoid;
}

.metric__title {
    font-size: 26px;
    color: v-bind('theme.TEXT_SECONDARY');
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    margin: 0 0 5px 0;
}

.metric__value {
    font-size: 34px;
    font-weight: v-bind('theme.FONT_WEIGHT_BOLD');
    color: v-bind('theme.PRIMARY_700');
    margin: 0 0 5px 0;
}

.metric__hint {
    font-size: 18px;
    line-height: v-bind('theme.LINE_HEIGHT_BODY');
    font-weight: v-bind('theme.FONT_WEIGHT_REGULAR');
    color: v-bind('theme.TEXT_PRIMARY');
}

/* Cuando hay severidad (fondo de color), el texto debe ir claro */
.metric__title--onColor,
.metric__value--onColor,
.metric__hint--onColor {
    color: v-bind('theme.SURFACE_0');
}

.metric__hint--onColor {
    opacity: 0.9;
}
</style>
