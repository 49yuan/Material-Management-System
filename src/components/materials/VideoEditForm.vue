<template>
    <div class="edit-form-overlay">
        <div class="edit-form">
            <h3>编辑视频信息</h3>

            <div class="form-group">
                <label>视频名称:</label>
                <input type="text" v-model="localName" placeholder="输入图片名称" />
            </div>

            <div class="form-group">
                <label>标签 (用,分隔):</label>
                <input type="text" v-model="localTags" />
            </div>

            <div class="form-actions">
                <button type="button" class="submit-btn" @click="handleSubmit" :disabled="!hasChanged">
                    保存
                </button>
                <button type="button" class="cancel-btn" @click="$emit('cancel')">
                    取消
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    video: {
        type: Object,
        required: true,
        default: () => ({
            id: '',
            name: '',
            url: '',
            tag: []
        })
    }
})

const emit = defineEmits(['submit', 'cancel'])

// 本地编辑的状态
const localName = ref(props.video.name || '')
const localTags = ref(props.video.tag && Array.isArray(props.video.tag) ? props.video.tag.join(',') : '');


// 检查是否有修改
const hasChanged = computed(() => {
    return localName.value !== props.video.name ||
        localTags.value !== (props.video.tag && Array.isArray(props.video.tag) ? props.video.tag.join(',') : '');
})

// 提交修改
const handleSubmit = () => {
    if (!hasChanged.value) return
    const newData = {
        name: localName.value.trim(),
        tags: localTags.value.trim()
    };
    emit('submit', newData);
};
// 监听外部video变化
watch(() => props.video, (newVal) => {
    localName.value = newVal.name || ''
    localTags.value = newVal.tag || ''
}, { immediate: true })
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
    width: 450px;
    max-width: 90%;
}

.edit-form h3 {
    margin-top: 0;
    color: #42b983;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
}

.form-group input {
    width: 95%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
}

.tag-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-height: 30px;
}

.tag {
    background: #f0f9eb;
    color: #67c23a;
    padding: 4px 8px;
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
}

.form-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

.submit-btn {
    background: #42b983;
    color: white;
}

.submit-btn:disabled {
    background: #ccc;
    cursor: not-allowed;
}

.cancel-btn {
    background: #f0f0f0;
    color: #666;
}

.cancel-btn:hover {
    background: #e0e0e0;
}
</style>