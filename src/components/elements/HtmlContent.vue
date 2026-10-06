<template>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div class="el-html" v-html="safeHtml" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DOMPurify from 'dompurify';
import { HtmlElement } from '../../types';

const props = defineProps<{
    element: HtmlElement;
}>();

// Sanitizado antes de inyectar: el PDF se renderiza en un Chromium con acceso a file://, así
// que se quitan <script>, handlers on*, iframes, etc. Clases y `style` se conservan.
const safeHtml = computed(() => DOMPurify.sanitize(props.element.content ?? ''));
</script>

<style scoped>
/* Raíz del @scope de Tailwind (ver services/tailwind.ts): el CSS compilado solo aplica a lo
   que está dentro de este div. */
.el-html {
    width: 100%;
}
</style>
