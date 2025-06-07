<template>
    <div class="upload-form-overlay" v-if="showForm">
        <div class="upload-form">
            <div class="form-header">
                <h3>上传文章</h3>
                <button class="close-btn" @click="closeForm">
                    <i class="icon-close">×</i>
                </button>
            </div>

            <form @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>文章名称:</label>
                    <input type="text" v-model="articleName" placeholder="请输入文章名称" required />
                </div>

                <div class="form-group">
                    <label>标签 (用逗号分隔):</label>
                    <input type="text" v-model="tags" placeholder="例如: 风景,户外,夏天" />
                </div>

                <div class="form-group file-upload">
                    <label>选择文章文件:</label>
                    <div class="upload-area" @click="triggerFileInput">
                        <input type="file" ref="fileInput" accept=".txt,.doc,.docx,.pdf,.md" @change="handleFileChange"
                            style="display: none" required>
                        <div v-if="!file" class="upload-placeholder">
                            <i class="icon-upload">↑</i>
                            <p>点击或拖拽文件到此处</p>
                            <p class="hint">支持 .txt, .doc, .docx, .pdf, .md 格式</p>
                        </div>
                        <div v-else class="file-info">
                            <i class="icon-file">📄</i>
                            <div class="file-details">
                                <p class="filename">{{ file.name }}</p>
                                <p class="filesize">{{ formatFileSize(file.size) }}</p>
                            </div>
                            <button type="button" class="remove-btn" @click.stop="removeFile">
                                <i class="icon-close">×</i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" :disabled="!isValid" class="submit-btn">
                        上传
                    </button>
                    <button type="button" @click="closeForm" class="cancel-btn">
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
    showForm: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits(['submit', 'cancel']);

const articleName = ref('');
const tags = ref('');
const file = ref(null);
const fileInput = ref(null);

const isValid = computed(() => {
    return articleName.value.trim() && file.value;
});

const triggerFileInput = () => {
    fileInput.value.click();
};

const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // 验证文件类型
    const allowedExtensions = ['txt', 'doc', 'docx', 'pdf', 'md'];
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
        alert('请上传 .txt, .doc, .docx, .pdf 或 .md 格式的文件');
        return;
    }

    file.value = selectedFile;

    // 仅当用户还没有填写文件名时，使用文件名作为默认值
    if (!articleName.value.trim()) {
        const rawName = selectedFile.name.replace(/\.[^/.]+$/, '') // 去除扩展名
        articleName.value = rawName
    }
};

const removeFile = () => {
    file.value = null;
    fileInput.value.value = '';
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleSubmit = () => {
    const formData = new FormData();
    formData.append('name', articleName.value);
    formData.append('file', file.value);
    formData.append('tag', tags.value);

    emit('submit', formData);
    resetForm();
};

const closeForm = () => {
    resetForm();
    emit('cancel');
};

const resetForm = () => {
    articleName.value = '';
    tags.value = '';
    file.value = null;
    if (fileInput.value) {
        fileInput.value.value = '';
    }
};

watch(() => props.showForm, (newVal) => {
    if (!newVal) {
        resetForm();
    }
});
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
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    border-bottom: 1px solid #f0f0f0;
}

.form-header h3 {
    margin: 0;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.85);
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.45);
    font-size: 16px;
    padding: 0;
}

form {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
}

.form-group input[type="text"] {
    width: 94%;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-size: 14px;
    transition: all 0.3s;
}

.form-group input[type="text"]:focus {
    border-color: #1890ff;
    outline: none;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.tag-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
}

.tag {
    background: #f0f5ff;
    color: #2f54eb;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.file-upload {
    margin-top: 24px;
}

.upload-area {
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #fafafa;
}

.upload-area:hover {
    border-color: #1890ff;
}

.upload-placeholder {
    color: rgba(0, 0, 0, 0.45);
}

.upload-placeholder .icon-upload {
    font-size: 24px;
    margin-bottom: 8px;
    color: #1890ff;
}

.hint {
    font-size: 12px;
    margin-top: 8px;
    color: rgba(0, 0, 0, 0.35);
}

.file-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-file {
    font-size: 24px;
    color: #1890ff;
}

.file-details {
    flex: 1;
    text-align: left;
}

.filename {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);
}

.filesize {
    margin: 4px 0 0;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
}

.remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.45);
    padding: 4px;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 24px;
}

.submit-btn,
.cancel-btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
}

.submit-btn {
    background: #1890ff;
    color: white;
    border: none;
}

.submit-btn:disabled {
    background: #d9d9d9;
    cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
    background: #40a9ff;
}

.cancel-btn {
    background: white;
    border: 1px solid #d9d9d9;
    color: rgba(0, 0, 0, 0.65);
}

.cancel-btn:hover {
    color: #1890ff;
    border-color: #1890ff;
}
</style>