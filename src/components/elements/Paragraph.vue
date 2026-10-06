<template>
    <p class="el-paragraph"><RichText :content="element.content" /></p>
</template>

<script setup lang="ts">

import { TextElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

defineProps<{
    element: TextElement;
}>();
</script>

<style scoped>
.el-paragraph {
    font-size: v-bind('theme.FONT_SIZE_BODY');
    line-height: v-bind('theme.LINE_HEIGHT_BODY');
    font-weight: v-bind('theme.FONT_WEIGHT_REGULAR');
    color: v-bind('theme.TEXT_PRIMARY');
    text-align: left;
    margin: 0;
}
</style>
