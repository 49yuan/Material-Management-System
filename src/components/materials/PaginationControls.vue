<template>
    <div class="pagination">
        <button :disabled="props.currentPage === 1" @click="$emit('page-change', props.currentPage - 1)">
            上一页
        </button>

        <button v-for="page in visiblePages" :key="page" :class="{ active: page === props.currentPage }"
            @click="$emit('page-change', page)">
            {{ page }}
        </button>

        <button :disabled="props.currentPage === props.totalPages" @click="$emit('page-change', props.currentPage + 1)">
            下一页
        </button>

        <div class="page-input">
            跳至 <input type="number" :min="1" :max="props.totalPages" :value="props.currentPage" @change="handlePageInput"> 页
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    currentPage: {
        type: Number,
        required: true
    },
    totalPages: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['page-change'])

const visiblePages = computed(() => {
    const pages = []
    const maxVisible = 5

    let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(props.totalPages, start + maxVisible - 1)

    if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }

    return pages
})

const handlePageInput = (e) => {
    const page = parseInt(e.target.value)
    if (page >= 1 && page <= props.totalPages) {
        emit('page-change', page)
    }
}
</script>

<style scoped>
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 20px;
}

.pagination button {
    padding: 6px 12px;
    border: 1px solid #ddd;
    background: white;
    cursor: pointer;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination button.active {
    background: #42b983;
    color: white;
    border-color: #42b983;
}

.page-input {
    margin-left: 15px;
}

.page-input input {
    width: 50px;
    padding: 5px;
    border: 1px solid #ddd;
    text-align: center;
}
</style>