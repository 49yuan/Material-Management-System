<template>
    <div class="category-layout">
        <!-- 这里可以放置分类页的公共布局 -->
        <router-view :categoryId="categoryId" :key="categoryId"></router-view> <!-- 子路由出口 -->
    </div>
</template>
<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = computed(() => route.meta.category_id);
</script>