<template>
    <div class="category-filter">
        <button v-for="category in props.categories" :key="category" :class="{ active: category === props.activeCategory }"
            @click="$emit('category-change', category)">
            {{ category }}
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    categories: {
        type: Array,
        required: true
    },
    activeCategory: {
        type: String,
        required: true
    }
})

defineEmits(['category-change'])
</script>

<style scoped>
.category-filter {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.category-filter button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
}

.category-filter button:hover {
    background: #f0f0f0;
}

.category-filter button.active {
    background: #42b983;
    color: white;
    border-color: #42b983;
}
</style>