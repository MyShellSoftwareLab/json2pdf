<template>
    <ul class="el-list el-list--numbered">
        <li v-for="(item, i) in element.items" :key="i"><RichText :content="item" /></li>
    </ul>
</template>

<script setup lang="ts">

import { NumberedListElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

defineProps<{
    element: NumberedListElement;
}>();
</script>

<style scoped>
.el-list {
    margin: 0 0 15px 0;
    color: v-bind('theme.TEXT_PRIMARY');
}

.el-list--numbered {
    list-style-type: decimal;
    padding-left: 20px;
}

.el-list--numbered li {
    font-size: v-bind('theme.FONT_SIZE_BODY');
    line-height: v-bind('theme.LINE_HEIGHT_BODY');
}
</style>
