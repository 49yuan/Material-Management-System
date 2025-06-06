<template>
    <div class="edit-form-overlay">
        <div class="edit-form">
            <div class="form-header">
                <h3>编辑文本</h3>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>文本名称</label>
                    <input type="text" v-model="localText.name" placeholder="请输入文本名称" required>
                </div>

                <div class="form-group">
                    <label>标签</label>
                    <input type="text" v-model="tagInput" placeholder="多个标签用逗号分隔">
                </div>

                <div class="form-actions">
                    <button type="submit" class="submit-btn">
                        保存
                    </button>
                    <button type="button" @click="$emit('cancel')" class="cancel-btn">
                        取消
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    text: {
        type: Object,
        required: true,
        default: () => ({
            id: '',
            name: '',
            content: '',
            tag: []
        })
    }
});

const emit = defineEmits(['submit', 'cancel']);

const localText = ref({ ...props.text });
const tagInput = ref(props.text.tag && Array.isArray(props.text.tag) ? props.text.tag.join(',') : '');

const handleSubmit = () => {
    const newData = {
        name: localText.value.name,
        tags: tagInput.value
    };
    emit('submit', props.text.id, newData);
};

watch(() => props.text, (newVal) => {
    localText.value = { ...newVal };
    tagInput.value = newVal.tag && Array.isArray(newVal.tag) ? newVal.tag.join(',') : '';
}, { immediate: true });
</script>

<style scoped>
.edit-form-overlay {
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

.edit-form {
    background: white;
    padding: 20px;
    border-radius: 8px;
    width: 600px;
    max-width: 90%;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
}

.form-group input,
.form-group textarea {
    width: 95%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.form-group textarea {
    min-height: 200px;
    resize: vertical;
}

.tag-preview {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.tag {
    background: #f0f0f0;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.empty-hint {
    color: #999;
    font-size: 12px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
}

.submit-btn {
    background: #42b983;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.cancel-btn {
    background: #f0f0f0;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}
</style>