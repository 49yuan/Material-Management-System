<template>
    <div class="app-container">
        <!-- 主内容区 -->
        <div class="text-gallery">
            <!-- 头部区域 -->
            <div class="gallery-header">
                <CategoryFilter :categories="categories" :active-category="activeCategory"
                    @category-change="handleCategoryChange" />
                <SearchBar v-model="searchQuery" @search="handleSearch" />
                <button v-if="authStore.isAdmin" class="upload-button" @click="showUploadForm = true">
                    <i class="icon-upload"></i> 上传文本
                </button>
            </div>

            <!-- 上传表单 -->
            <TextUploadForm :showForm="showUploadForm" @submit="handleUpload" @cancel="showUploadForm = false" />

            <!-- 文本表格 -->
            <div class="table-container">
                <table class="text-table">
                    <thead>
                        <tr>
                            <th style="width: 50%;">篇名</th>
                            <th style="width: 12.5%;">标签</th>
                            <th style="width: 37.5%;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="text in paginatedTexts" :key="text.id">
                            <td>{{ text.name }}</td>
                            <td>
                                <div class="tags">
                                    <span v-for="tag in getTags(text.tag)" :key="tag" class="tag">
                                        {{ tag }}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div class="actions">
                                    <button class="download-btn" @click="handleDownload(text)">
                                        <!-- <i class="icon-download"></i>  -->
                                        下载
                                    </button>
                                    <button v-if="authStore.isAdmin" class="edit-btn" @click="handleEdit(text)">
                                        <!-- <i class="icon-edit"></i>  -->
                                        编辑
                                    </button>
                                    <button v-if="authStore.isAdmin" class="delete-btn" @click="showDeleteConfirm(text)">
                                        <!-- <i class="icon-delete"></i>  -->
                                        删除
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- 分页控件 -->
            <PaginationControls :current-page="currentPage" :total-pages="totalPages" @page-change="handlePageChange" />
        </div>

        <!-- 对话框和表单（放在最外层） -->
        <ConfirmDialog v-if="deleteTarget" :visible="!!deleteTarget" :message="`确定要删除文本 '${deleteTarget.name}' 吗？`"
            @confirm="handleDeleteConfirm" @cancel="deleteTarget = null">
            <template #extra>
                <label class="delete-checkbox">
                    <input type="checkbox" v-model="deleteSourceFile">
                    同时删除源文件
                </label>
            </template>
        </ConfirmDialog>

        <TextEditForm v-if="editTarget" :text="editTarget" @submit="handleEditSubmit" @cancel="editTarget = null" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElLoading, ElMessage } from 'element-plus';
import axios from 'axios';
import TextUploadForm from '@/components/materials/TextUploadForm.vue';
import TextEditForm from '@/components/materials/TextEditForm.vue';
import ConfirmDialog from '@/components/materials/ConfirmDialog.vue';
import CategoryFilter from '@/components/materials/CategoryFilter.vue';
import SearchBar from '@/components/materials/SearchBar.vue';
import PaginationControls from '@/components/materials/PaginationControls.vue';

const props = defineProps({
    categoryId: {
        type: String,
        required: true
    }
});

const authStore = useAuthStore();
const texts = ref([]);
const searchQuery = ref('');
const activeCategory = ref('全部');
const currentPage = ref(1);
const pageSize = 20;
const showUploadForm = ref(false);
const deleteTarget = ref(null);
const deleteSourceFile = ref(false);
const editTarget = ref(null);

// 获取文本数据
const fetchTexts = async () => {
    try {
        const response = await axios.get(`/resource/${props.categoryId}/article`);
        if (response.data?.code === 200) {
            texts.value = response.data.data.content.map(item => ({
                id: item.id,
                name: item.name,
                type: item.type,
                category_id: item.category_id,
                path: item.url,
                tag: Array.isArray(item.tag) ? item.tag : []
            }));
        }
    } catch (error) {
        console.error('获取文本失败:', error);
        alert('获取文本列表失败');
    }
};

// 工具函数
const getFileType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const types = {
        'txt': '文本文件',
        'doc': 'Word文档',
        'docx': 'Word文档',
        'pdf': 'PDF文档',
        'md': 'Markdown'
    };
    return types[extension] || extension.toUpperCase();
};

const getTags = (tagArray) => {
    return tagArray || [];
};

// 计算属性
const categories = computed(() => {
    const allTags = texts.value.flatMap(text => getTags(text.tag));
    return ['全部', ...new Set(allTags)];
});

const filteredTexts = computed(() => {
    let result = texts.value;

    if (activeCategory.value !== '全部') {
        result = result.filter(text =>
            getTags(text.tag).includes(activeCategory.value)
        );
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(text =>
            text.name.toLowerCase().includes(query) ||
            (text.content && text.content.toLowerCase().includes(query)) ||
            getTags(text.tag).some(tag => tag.toLowerCase().includes(query))
        );
    }

    return result;
});

const totalPages = computed(() =>
    Math.ceil(filteredTexts.value.length / pageSize)
);

const paginatedTexts = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredTexts.value.slice(start, end);
});

// 事件处理
const handleCategoryChange = (category) => {
    activeCategory.value = category;
    currentPage.value = 1;
};

const handleSearch = () => {
    currentPage.value = 1;
};

const handlePageChange = (page) => {
    currentPage.value = page;
};

// 上传文本
const handleUpload = async (formData) => {
    const loading = ElLoading.service({
        lock: true,
        text: '文章上传中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        formData.append('category_id', props.categoryId);
        formData.append('type', 'article');

        const response = await axios.post('/resource', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200) {
            ElMessage.success('上传成功！');
            await fetchTexts();
            showUploadForm.value = false;
        }
    } catch (error) {
        ElMessage.error(`上传失败: ${error.message}`);
    } finally {
        loading.close();
    }
};

// 下载文本
const handleDownload = async (text) => {
    try {
        const link = document.createElement('a');
        link.href = text.path;
        link.setAttribute('download', text.name || 'file.mcs');
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败');
    }
};

// 编辑文本
const handleEdit = (text) => {
    editTarget.value = { ...text };
};

const handleEditSubmit = async (id, updatedText) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在更新文章信息...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const response = await axios.put('/resource', {
            id: id,
            name: updatedText.name,
            tag: updatedText.tags
        });

        if (response.data.code === 200) {
            ElMessage.success('更新成功！');
            await fetchTexts();
            editTarget.value = null;
        } else {
            ElMessage.error(`更新失败: ${response.data.msg}`);
        }
    } catch (error) {
        ElMessage.error(`更新失败: ${error.message}`);
    } finally {
        loading.close();
    }
};

// 删除文本
const showDeleteConfirm = (text) => {
    deleteTarget.value = { ...text };
};

const handleDeleteConfirm = async () => {
    if (!deleteTarget.value) return;
    const loading = ElLoading.service({
        lock: true,
        text: '正在删除文章...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const response = await axios.delete(`/resource/${deleteTarget.value.id}`, {
            data: { deleteSource: deleteSourceFile.value }
        });

        if (response.data.code === 200) {
            ElMessage.success('删除成功！');
            await fetchTexts();
        } else {
            alert(`删除失败: ${response.data.msg}`);
        }
    } catch (error) {
        ElMessage.error(`删除失败: ${error.message}`);
    } finally {
        deleteTarget.value = null;
        deleteSourceFile.value = false;
        loading.close();
    }
};

// 初始化
onMounted(fetchTexts);
</script>

<style scoped>
.app-container {
    position: relative;
}

.text-gallery {
    width: 100%;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
}

.upload-button {
    padding: 8px 16px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
}

.table-container {
    overflow-x: auto;
    margin: 20px 0;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
}

.text-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.text-table th {
    background-color: #fafafa;
    padding: 12px 16px;
    text-align: left;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    border-bottom: 1px solid #f0f0f0;
}

.text-table td {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    color: rgba(0, 0, 0, 0.65);
}

.text-table tr:hover td {
    background-color: #fafafa;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
}

.tag {
    background-color: #f0f5ff;
    color: #2f54eb;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
}

.actions {
    display: flex;
    gap: 8px;
}

.actions button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    transition: all 0.3s;
}

.download-btn {
    background-color: #f6ffed;
    color: #52c41a;
    border: 1px solid #b7eb8f;
}

.download-btn:hover {
    background-color: #d9f7be;
}

.edit-btn {
    background-color: #e6f7ff;
    color: #1890ff;
    border: 1px solid #91d5ff;
}

.edit-btn:hover {
    background-color: #bae7ff;
}

.delete-btn {
    background-color: #fff2f0;
    color: #ff4d4f;
    border: 1px solid #ffccc7;
}

.delete-btn:hover {
    background-color: #ffccc7;
}

.icon-upload,
.icon-download,
.icon-edit,
.icon-delete {
    font-size: 14px;
}
</style>