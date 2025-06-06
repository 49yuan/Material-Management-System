<template>
    <div class="image-card">
        <div class="image-container">
            <audio controls>
                <source :src="audioUrl" type="audio/mpeg">
                您的浏览器不支持音频元素
            </audio>
        </div>

        <div class="card-footer">
            <div class="tags">
                {{ audioName }}
            </div>

            <div v-if="isAdmin" class="actions">
                <button class="edit-btn" @click.stop="handleEdit">编辑</button>
                <button class="delete-btn" @click.stop="handleDelete">删除</button>
            </div>
        </div>

        <ImageEditForm v-if="showEditForm" :audio="{ id: audioId, name: audioName, url: audioUrl, tag: tag }"
            @submit="handleEditSubmit" @cancel="showEditForm = false" />

        <ConfirmDialog v-model:visible="showDeleteConfirm" message="确定要删除此音频吗?" @confirm="handleDeleteConfirm">
            <template #extra>
                <label>
                    <input type="checkbox" v-model="deleteSourceFile" />
                    同时删除源文件
                </label>
            </template>
        </ConfirmDialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ImageEditForm from './AudioEditForm.vue'
import ConfirmDialog from './ConfirmDialog.vue'

const props = defineProps({
    audioUrl: String,
    audioName: String,
    audioId: String,
    tag: Array,
    isAdmin: Boolean
});

const emit = defineEmits(['edit', 'delete'])

const showEditForm = ref(false)
const showDeleteConfirm = ref(false)
const deleteSourceFile = ref(false)

const handleEdit = () => {
    showEditForm.value = true
}

const handleDelete = () => {
    showDeleteConfirm.value = true
}

const handleEditSubmit = async (updatedData) => {
    try {
        // 等待父组件的 edit 事件返回的 Promise
        await emit('edit', props.audioId, updatedData);
        showEditForm.value = false; // 只有成功才会关闭表单
    } catch (error) {
        // 失败时保持表单打开
        console.error('编辑失败:', error);
    }
};

const handleDeleteConfirm = async () => {
    try {
        await emit('delete', props.audioId, deleteSourceFile.value);
        showDeleteConfirm.value = false;
        deleteSourceFile.value = false;
    } catch {
        // 失败时保持确认框打开
    }
}
</script>

<style scoped>
.image-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background: white;
}

.image-container {
    cursor: pointer;
    overflow: hidden;
}

.image-container audio {
    padding: 10px;
    padding-top: 20px;
    padding-bottom: 0px;
    width: 100%;
    outline: none;
    box-sizing: border-box;
}

.card-footer {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tags {
    font-size: 14px;
    color: #666;
}

.actions {
    display: flex;
    gap: 8px;
}

.edit-btn,
.delete-btn {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    transition: all 0.2s;
}

.edit-btn {
    background-color: #e6f7ff;
    color: #1890ff;
}

.edit-btn:hover {
    background-color: #bae7ff;
}

.delete-btn {
    background-color: #fff2f0;
    color: #ff4d4f;
}

.delete-btn:hover {
    background-color: #ffccc7;
}
</style>