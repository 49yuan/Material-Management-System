<template>
    <div class="search-bar">
        <input type="text" v-model="inputValue" placeholder="搜索图片标签..." @input="handleInput" />
        <button @click="handleSearch">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18">
                <path
                    d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
        </button>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['search'])

const inputValue = ref('')

// 输入时实时触发搜索（可添加防抖）
const handleInput = () => {
    emit('search', inputValue.value.trim())
}

// 点击搜索按钮触发
const handleSearch = () => {
    emit('search', inputValue.value.trim())
}
</script>

<style scoped>
.search-bar {
    display: flex;
    align-items: center;
    border: 1px solid #ddd;
    border-radius: 20px;
    overflow: hidden;
    padding: 5px 10px;
    background: white;
    flex-grow: 1;
    max-width: 400px;
}

.search-bar input {
    border: none;
    outline: none;
    padding: 5px;
    flex-grow: 1;
    font-size: 14px;
}

.search-bar button {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 5px;
    color: #666;
}

.search-bar button:hover {
    color: #42b983;
}
</style>