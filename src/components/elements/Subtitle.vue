<template>
    <h2 class="el-subtitle"><RichText :content="element.content" /></h2>
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
.el-subtitle {
    font-size: v-bind('theme.FONT_SIZE_SUBTITLE');
    line-height: v-bind('theme.LINE_HEIGHT_SUBTITLE');
    color: v-bind('theme.SECONDARY_500');
    font-weight: v-bind('theme.FONT_WEIGHT_MEDIUM');
    margin: 0;
}
</style>
