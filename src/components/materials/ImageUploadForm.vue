<template>
    <div class="upload-form-overlay">
        <div class="upload-form">
            <h3>{{ isBatchMode ? '批量上传图片' : '上传图片' }}</h3>

            <div v-if="!isBatchMode" class="upload-mode-toggle">
                <button @click="isBatchMode = true">切换到批量上传</button>
            </div>
            <div v-else class="upload-mode-toggle">
                <button @click="isBatchMode = false">切换到单文件上传</button>
            </div>

            <!-- 单文件上传表单 -->
            <form v-if="!isBatchMode" @submit.prevent="handleSubmit">
                <div class="form-group">
                    <label>图片名称:</label>
                    <input type="text" v-model="imageName" placeholder="例如: 夏日风景" required />
                </div>

                <div class="form-group">
                    <label>标签 (用,分隔):</label>
                    <input type="text" v-model="tags" placeholder="例如: 风景,户外,夏天" />
                </div>

                <div class="form-group">
                    <label>选择图片:</label>
                    <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" required />
                </div>

                <div class="form-actions">
                    <button type="submit" :disabled="!isValid">上传</button>
                    <button type="button" @click="$emit('cancel')">取消</button>
                </div>
            </form>

            <!-- 批量上传表单 -->
            <div v-else>
                <div class="form-group">
                    <label>选择多张图片:</label>
                    <input type="file" ref="batchFileInput" accept="image/*" multiple @change="handleBatchFileChange"
                        required />
                </div>

                <div class="batch-preview" v-if="batchFiles.length > 0">
                    <h4>已选择 {{ batchFiles.length }} 张图片</h4>

                    <div class="file-list">
                        <div v-for="(file, index) in paginatedFiles" :key="index" class="file-item">
                            <img v-if="file.preview" :src="file.preview" alt="预览" class="thumbnail" />
                            <div class="file-name">{{ file.name }}</div>
                            <div class="file-size">{{ formatFileSize(file.size) }}</div>
                        </div>
                    </div>
                    <div class="pagination-controls">
                        <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
                        <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
                        <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="button" @click="handleBatchSubmit" :disabled="batchFiles.length === 0">
                        上传全部
                    </button>
                    <button type="button" @click="$emit('cancel')">取消</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { ElLoading, ElMessage } from 'element-plus'

const emit = defineEmits(['submit', 'cancel'])
const props = defineProps({
    categoryId: {
        type: [String, Number],
        required: true
    }
})

// 单文件上传相关状态
const imageName = ref('')
const tags = ref('')
const file = ref(null)
const fileInput = ref(null)

// 批量上传相关状态
const isBatchMode = ref(false)
const batchFileInput = ref(null)
const batchFiles = ref([])
const currentPage = ref(1)
const itemsPerPage = 6 // 每页显示6个文件

const isValid = computed(() => {
    return imageName.value.trim() && file.value;
})

// 分页计算属性
const totalPages = computed(() => {
    return Math.ceil(batchFiles.value.length / itemsPerPage)
})

const paginatedFiles = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return batchFiles.value.slice(start, end)
})

// 文件大小格式化
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 单文件处理
const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    file.value = selectedFile

    if (!imageName.value.trim()) {
        const rawName = selectedFile.name.replace(/\.[^/.]+$/, '')
        imageName.value = rawName
    }
}

const handleSubmit = () => {
    const formData = new FormData()
    formData.append('name', imageName.value)
    formData.append('file', file.value)
    formData.append('tag', tags.value)

    emit('submit', formData)

    // 重置表单
    imageName.value = ''
    tags.value = ''
    file.value = null
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

// 批量文件处理
const handleBatchFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    batchFiles.value = []
    currentPage.value = 1

    // 为每个文件生成预览
    for (const file of files) {
        const preview = await generatePreview(file)
        batchFiles.value.push({
            file,
            name: file.name.replace(/\.[^/.]+$/, ''),
            size: file.size,
            preview
        })
    }
}

const generatePreview = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
    })
}

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const handleBatchSubmit = () => {
    // 将文件数据传递给父组件处理
    emit('batch-submit', batchFiles.value.map(item => ({
        file: item.file,
        name: item.name
    })));

    // 重置状态
    batchFiles.value = [];
    if (batchFileInput.value) {
        batchFileInput.value.value = '';
    }
}

// 切换模式时重置状态
watch(isBatchMode, (newVal) => {
    if (newVal) {
        // 切换到批量模式，重置单文件状态
        imageName.value = ''
        tags.value = ''
        file.value = null
        if (fileInput.value) {
            fileInput.value.value = ''
        }
    } else {
        // 切换到单文件模式，重置批量状态
        batchFiles.value = []
        if (batchFileInput.value) {
            batchFileInput.value.value = ''
        }
    }
})
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
    width: 600px;
    max-width: 90%;
    max-height: 90vh;
    overflow-y: auto;
}

.upload-mode-toggle {
    margin-bottom: 15px;
    margin-right: 12px;
    text-align: right;
}

.upload-mode-toggle button {
    background: #f0f0f0;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input[type="text"],
.form-group input[type="file"] {
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

.batch-preview {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
}

.pagination-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin: 15px 0;
}

.pagination-controls button {
    padding: 5px 10px;
    background: #f0f0f0;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.pagination-controls button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.file-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-top: 15px;
}

.file-item {
    border: 1px solid #eee;
    padding: 10px;
    border-radius: 4px;
    text-align: center;
}

.thumbnail {
    max-width: 100%;
    height: 80px;
    object-fit: contain;
    margin-bottom: 5px;
}

.file-name {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size {
    font-size: 11px;
    color: #888;
}
</style>