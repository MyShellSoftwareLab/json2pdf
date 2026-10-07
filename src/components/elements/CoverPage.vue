<template>
    <div class="cover">
        <div class="cover__brand">
            <img v-if="element.logo" :src="element.logo" alt="" class="cover__logo" />
        </div>

        <div class="cover__center">
            <div v-if="element.badge" class="cover__badge">{{ element.badge }}</div>
            <h1 class="cover__title">
                <template v-if="titleLines">
                    <span
                        v-for="(line, i) in titleLines" :key="i"
                        class="cover__title-line" :class="{ 'cover__title-line--accent': line.accent }">
                        {{ line.text }}
                    </span>
                </template>
                <RichText v-else :content="element.title" />
            </h1>
            <h2 v-if="element.subtitle" class="cover__subtitle"><RichText :content="element.subtitle" /></h2>
        </div>

        <div v-if="element.footer" class="cover__footer"><RichText :content="element.footer" /></div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CoverPageElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

const themeStyles = { ...theme };

const props = defineProps<{
    element: CoverPageElement;
}>();

const titleLines = computed(() => (Array.isArray(props.element.title) ? props.element.title : null));
</script>

<style scoped>
/* =============================================================================
   COVER PAGE — ocupa una hoja completa (el viewport es el área imprimible, ver
   pdfOptions.ts) y siempre cierra con salto de página, sin depender de la regla
   `pdf__break-before` de Elements.vue (que solo aplica a elementos `title`).
============================================================================= */
.cover {
    box-sizing: border-box;
    /* Hoja propia sin márgenes (@page cover en base.css): la portada siempre va a sangre, sin
       importar `options.margin`. Al imprimir, vw/vh se resuelven contra esa hoja, así que
       100vw x 100vh es la página completa. `calc(50% - 50vw)` la corre hasta el borde
       izquierdo (todos los contenedores están centrados), y -20px compensa el padding
       superior del body. */
    page: cover;
    width: 100vw;
    min-height: 100vh;
    margin: -20px 0 0 calc(50% - 50vw);
    padding: 60px 64px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: v-bind('themeStyles.TEXT_PRIMARY');
    break-after: page;
}

.cover__brand {
    line-height: 0;
}

.cover__logo {
    max-width: 140px;
    max-height: 48px;
    width: auto;
    height: auto;
    display: block;
}

.cover__center {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
}

.cover__badge {
    display: inline-block;
    align-self: flex-start;
    padding: 6px 16px;
    border-radius: v-bind('themeStyles.RADIUS_FULL');
    background-color: color-mix(in srgb, v-bind('themeStyles.PRIMARY_500') 12%, transparent);
    color: v-bind('themeStyles.PRIMARY_600');
    font-size: 13px;
    font-weight: v-bind('themeStyles.FONT_WEIGHT_SEMIBOLD');
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.cover__title {
    margin: 0;
    font-size: 44px;
    line-height: 1.15;
    font-weight: v-bind('themeStyles.FONT_WEIGHT_EXTRABOLD');
    color: v-bind('themeStyles.SECONDARY_800');
    max-width: 80%;
}

/* Título de líneas mezcladas (ver CoverPageTitleLine en types.ts) — cada línea es su propio
   bloque para poder colorear una sola distinto a las demás. */
.cover__title-line {
    display: block;
}

.cover__title-line--accent {
    color: v-bind('themeStyles.PRIMARY_600');
}

.cover__subtitle {
    margin: 0;
    font-size: 24px;
    line-height: 1.3;
    font-weight: v-bind('themeStyles.FONT_WEIGHT_MEDIUM');
    color: v-bind('themeStyles.SECONDARY_400');
}

.cover__footer {
    font-size: 14px;
    color: v-bind('themeStyles.SURFACE_400');
}
</style>
