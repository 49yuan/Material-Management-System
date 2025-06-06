<template>
    <div class="video-card">
        <div class="video-container">
            <video :src="videoUrl" :alt="videoName" controls></video>
        </div>

        <div class="card-footer">
            <div class="tags">
                {{ videoName }}
            </div>

            <div v-if="isAdmin" class="actions">
                <button class="edit-btn" @click.stop="handleEdit">编辑</button>
                <button class="delete-btn" @click.stop="handleDelete">删除</button>
            </div>
        </div>

        <VideoEditForm v-if="showEditForm" :video="{ id: videoId, name: videoName, url: videoUrl, tag: tag }"
            @submit="handleEditSubmit" @cancel="showEditForm = false" />

        <ConfirmDialog v-model:visible="showDeleteConfirm" message="确定要删除这个视频吗?" @confirm="handleDeleteConfirm">
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
import { ref, computed } from 'vue';
import VideoEditForm from './VideoEditForm.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps({
    videoUrl: {
        type: String,
        required: true
    },
    videoName: {
        type: String,
        required: true
    },
    videoId: {
        type: String,
        required: true
    },
    tag: {
        type: Array,
        default: () => []
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['edit', 'delete']);

const showEditForm = ref(false);
const showDeleteConfirm = ref(false);
const deleteSourceFile = ref(false);

const handleEdit = () => {
    showEditForm.value = true;
};

const handleDelete = () => {
    showDeleteConfirm.value = true;
};

const handleEditSubmit = async (updatedData) => {
    try {
        await emit('edit', props.videoId, updatedData);
        showEditForm.value = false;
    } catch {
        // 失败时保持确认框打开
    }
};

const handleDeleteConfirm = async () => {
    try {
        await emit('delete', props.videoId, deleteSourceFile.value);
        showDeleteConfirm.value = false;
        deleteSourceFile.value = false;
    } catch {
        // 失败时保持确认框打开
    }
};
</script>

<style scoped>
.video-card {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    background: white;
}

.video-container {
    cursor: pointer;
    aspect-ratio: 16/9;
    overflow: hidden;
}

.video-container video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.video-container:hover video {
    transform: scale(1.05);
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

.expanded-view {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.expanded-video {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
}

.close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
}
</style>