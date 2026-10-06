<template>
    <h1 class="el-title"><RichText :content="element.content" /></h1>
</template>

<script setup lang="ts">

import { TextElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

const themeStyles = { ...theme };

defineProps<{
    element: TextElement;
}>();
</script>

<style scoped>
.el-title {
    font-size: v-bind('themeStyles.FONT_SIZE_TITLE');
    line-height: v-bind('themeStyles.LINE_HEIGHT_TITLE');
    color: v-bind('themeStyles.PRIMARY_400');
    font-weight: v-bind('themeStyles.FONT_WEIGHT_MEDIUM');
    letter-spacing: -0.01em;
    margin: 0;
}

.el-title :deep(.rt-bold) {
    font-weight: v-bind('themeStyles.FONT_WEIGHT_BOLD');
}
</style>
