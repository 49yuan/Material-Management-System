<template>
  <div class="image-view">
    <ImageGallery :category-id="categoryId" />
  </div>
</template>

<script setup>
import ImageGallery from '@/components/pages/ImageGallery.vue'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const categoryId = ref(route.params.category_id || route.meta.category_id);

</script>

