<template>
    <ul class="el-list el-list--bullet">
        <li v-for="(item, i) in element.items" :key="i"><RichText :content="item" /></li>
    </ul>
</template>

<script setup lang="ts">

import { BulletPointsElement } from '../../types';
import * as theme from '../../theme';
import RichText from '../RichText.vue';

defineProps<{
    element: BulletPointsElement;
}>();
</script>

<style scoped>
.el-list {
    margin: 0 0 15px 0;
    color: v-bind('theme.TEXT_PRIMARY');
}

.el-list--bullet {
    list-style-type: disc;
    padding-left: 20px;
}

.el-list--bullet li {
    font-size: v-bind('theme.FONT_SIZE_BODY');
    line-height: v-bind('theme.LINE_HEIGHT_BODY');
    margin-bottom: 4px;
}
</style>
