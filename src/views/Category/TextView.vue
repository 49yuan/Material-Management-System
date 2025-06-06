<template>
    <div class="text-view">
        <TextGallery :category-id="categoryId" />
    </div>
</template>

<script setup>
import TextGallery from '@/components/pages/TextGallery.vue'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = ref(route.params.category_id || route.meta.category_id);
</script>