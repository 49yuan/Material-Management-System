<template>
    <div class="audio-view">
        <AudioGallery :category-id="categoryId" />
    </div>
</template>

<script setup>
import AudioGallery from '@/components/pages/AudioGallery.vue'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = ref(route.params.category_id || route.meta.category_id);

</script>