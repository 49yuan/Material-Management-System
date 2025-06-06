<template>
  <div class="video-view">
    <VideoGallery :category-id="categoryId" />
  </div>
</template>

<script setup>
import VideoGallery from '@/components/pages/VideoGallery.vue'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = ref(route.params.category_id || route.meta.category_id);

</script>
