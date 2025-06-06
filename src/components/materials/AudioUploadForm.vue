<template>
    <div class="upload-form-overlay">
        <div class="upload-form">
            <h3>上传音频</h3>
            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>音频名称:</label>
                    <input type="text" v-model="audioName" placeholder="例如: 夏日风景" required />
                </div>

                <div class="form-group">
                    <label>标签 (用,分隔):</label>
                    <input type="text" v-model="tags" placeholder="例如: 风景,户外,夏天" />
                </div>

                <div class="form-group">
                    <label>选择音频:</label>
                    <input type="file" ref="fileInput" accept="audio/*" @change="handleFileChange" required />
                </div>

                <div class="form-actions">
                    <button type="submit" :disabled="!isValid">上传</button>
                    <button type="button" @click="$emit('cancel')">取消</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
const emit = defineEmits(['submit', 'cancel']);

const audioName = ref('');  // 音频名称字段
const tags = ref('');
const file = ref(null);
const fileInput = ref(null);

const isValid = computed(() => {
    return audioName.value.trim() && file.value;
});

const handleFileChange = (e) => {
    file.value = e.target.files[0];
};

const handleSubmit = () => {
    const formData = new FormData();
    formData.append('name', audioName.value);  // 添加音频名称
    formData.append('file', file.value);      // 添加音频文件
    formData.append('tag', tags.value);       // 添加标签

    emit('submit', formData);

    // 重置表单
    audioName.value = '';
    tags.value = '';
    file.value = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};
</script>

<style scoped>
.upload-form-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.upload-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 400px;
    max-width: 90%;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input[type="text"] {
    width: 95%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.form-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.form-actions button:first-child {
    background: #42b983;
    color: white;
}

.form-actions button:last-child {
    background: #f0f0f0;
}
</style>