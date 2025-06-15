<template>
    <div class="audio-gallery">
        <div class="gallery-header">
            <CategoryFilter :categories="categories" :active-category="activeCategory"
                @category-change="handleCategoryChange" />
            <SearchBar v-model="searchQuery" @search="handleSearch" />
            <div v-if="batchMode" class="batch-actions">
                <button class="batch-button" @click="handleBatchDelete" :disabled="selectedAudios.size === 0">
                    批量删除 ({{ selectedAudios.size }})
                </button>
                <button class="batch-button" @click="openMoveDialog" :disabled="selectedAudios.size === 0">
                    批量移动 ({{ selectedAudios.size }})
                </button>
                <button class="batch-button cancel" @click="exitBatchMode">
                    取消
                </button>
            </div>
            <div v-else class="normal-actions">
                <button v-if="authStore.isAdmin" class="upload-button" @click="enterBatchMode">
                    批量操作
                </button>
                <button v-if="authStore.isAdmin" class="upload-button" @click="showUploadForm = true">
                    上传音频
                </button>
            </div>
        </div>

        <AudioUploadForm v-if="showUploadForm" @submit="handleUpload" @batch-submit="handleBatchUpload"
            :categoryId="props.categoryId" @cancel="showUploadForm = false" />

        <el-dialog v-model="showMoveDialog" title="批量移动音频" width="30%" style="top: 35%; transform: translateY(-50%)">
            <el-select v-model="moveTargetCategory" placeholder="选择目标分类" style="width: 100%" filterable clearable>
                <el-option v-for="category in availableCategories" :key="category.id" :label="category.name"
                    :value="category.id" :disabled="category.id === props.categoryId" />
            </el-select>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="showMoveDialog = false">取消</el-button>
                    <el-button type="primary" @click="confirmBatchMove"
                        :disabled="!moveTargetCategory || moveTargetCategory === props.categoryId">
                        确认移动
                    </el-button>
                </span>
            </template>
        </el-dialog>

        <div class="audio-grid">
            <div v-for="audio in paginatedAudios" :key="audio.id" class="audio-card-wrapper">
                <input v-if="batchMode" type="checkbox" class="audio-checkbox" v-model="selectedAudios" :value="audio.id" />
                <AudioCard :audio-url="audio.url" :audio-name="audio.name" :audio-id="audio.id"
                    :is-admin="authStore.isAdmin" :tag="audio.tag" @edit="handleEditAudio" @delete="handleDeleteAudio" />
            </div>
        </div>

        <PaginationControls :current-page="currentPage" :total-pages="totalPages" @page-change="handlePageChange" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import AudioCard from '@/components/materials/AudioCard.vue';
import AudioUploadForm from '@/components/materials/AudioUploadForm.vue';
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
const audios = ref([]);
const searchQuery = ref('');
const activeCategory = ref('全部');
const currentPage = ref(1);
const pageSize = 6;
const showUploadForm = ref(false);
// 批量操作相关状态
const batchMode = ref(false);
const selectedAudios = ref(new Set());
const showMoveDialog = ref(false);
const moveTargetCategory = ref('');
const availableCategories = ref([]);
// 获取音频数据
const fetchAudios = async () => {
    try {
        const response = await axios.get(`/resource/${props.categoryId}/music`);
        if (response.data?.code === 200) {
            audios.value = response.data.data.content.map(item => ({
                id: item.id,
                url: item.url,
                name: item.name,
                type: item.type,
                category_id: item.category_id,
                tag: Array.isArray(item.tag) ? item.tag : []
            }));
        } else {
            console.error('获取音频失败:', response.data?.msg);
        }
    } catch (error) {
        console.error('获取音频失败:', error);
    }
};
// 获取分类列表
const fetchCategories = async () => {
    try {
        const response = await axios.get('/category');
        if (response.data?.code === 200) {
            availableCategories.value = response.data.data;
            // 设置默认值（当前分类）
            moveTargetCategory.value = props.categoryId;
        } else {
            console.error('获取分类失败:', response.data?.msg);
            ElMessage.error('获取分类列表失败');
        }
    } catch (error) {
        console.error('获取分类失败:', error);
        ElMessage.error('获取分类列表失败');
    }
};
// 打开移动对话框时获取分类
const openMoveDialog = () => {
    fetchCategories();
    showMoveDialog.value = true;
};
// 计算属性
const categories = computed(() => {
    const allTags = audios.value.flatMap(audio => audio.tag);
    return ['全部', ...new Set(allTags)];
});

const filteredAudios = computed(() => {
    let result = audios.value;

    // 分类筛选
    if (activeCategory.value !== '全部') {
        result = result.filter(audio =>
            audio.tag.includes(activeCategory.value)
        );
    }

    // 搜索筛选
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(audio =>
            (audio.name && audio.name.toLowerCase().includes(query)) ||
            audio.tag.some(tag => tag.toLowerCase().includes(query))
        );
    }

    return result;
});

const totalPages = computed(() =>
    Math.ceil(filteredAudios.value.length / pageSize)
);

const paginatedAudios = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredAudios.value.slice(start, end);
});

// 事件处理
const handleCategoryChange = (category) => {
    activeCategory.value = category;
    currentPage.value = 1;
};

const handleSearch = (query) => {
    searchQuery.value = query;
    currentPage.value = 1;
};

const handlePageChange = (page) => {
    currentPage.value = page;
};

// 上传音频
const handleUpload = async (formData) => {
    const loading = ElLoading.service({  // Element Plus 的全局加载
        lock: true,
        text: '音频上传中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        formData.append('category_id', props.categoryId);
        formData.append('type', 'music');

        const response = await axios.post('/resource', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200) {
            ElMessage.success('上传成功！');
            await fetchAudios();
            showUploadForm.value = false;
        } else {
            ElMessage.error(`上传失败: ${response.data.msg}`);
        }
    } catch (error) {
        ElMessage.error(`上传失败: ${error.message}`);
    } finally {
        loading.close();
    }
};
const handleBatchUpload = async (files) => {
    const loading = ElLoading.service({
        lock: true,
        text: `正在上传 ${files.length} 个音频，请稍候...`,
        background: 'rgba(0, 0, 0, 0.7)'
    });

    try {
        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append('file', file.file);
                formData.append('name', file.name);
                formData.append('category_id', props.categoryId);
                formData.append('type', 'music');

                const response = await axios.post('/resource', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data.code === 200) {
                    successCount++;
                } else {
                    failCount++;
                    ElMessage.warning(`文件 ${file.name} 上传失败: ${response.data.msg}`);
                }
            } catch (error) {
                failCount++;
                const errorMsg = error.response?.data?.message || error.message;
                ElMessage.warning(`文件 ${file.name} 上传出错: ${errorMsg}`);
            }

            await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (failCount === 0) {
            ElMessage.success(`全部 ${successCount} 个音频上传成功！`);
        } else {
            ElMessage.warning(`上传完成，成功 ${successCount} 个，失败 ${failCount} 个`);
        }

        await fetchAudios(); // 刷新数据
    } catch (error) {
        ElMessage.error(`批量上传出错: ${error.message}`);
    } finally {
        loading.close();
    }
}
// 编辑音频
const handleEditAudio = async (id, newData) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在更新音频信息...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const response = await axios.put('/resource', {
            id: id,
            name: newData.name,
            tag: newData.tags
        });

        if (response.data.code === 200) {
            ElMessage.success('更新成功！');
            await fetchAudios();
        } else {
            ElMessage.error(`更新失败: ${response.data.msg}`);
        }
    } catch (error) {
        ElMessage.error(`更新失败: ${error.message}`);
    } finally {
        loading.close();
    }
};

// 删除音频
const handleDeleteAudio = async (id) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在删除音频...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const response = await axios.delete(`/resource/${id}`);
        if (response.data.code === 200) {
            ElMessage.success('删除成功！');
            await fetchAudios();
        } else {
            ElMessage.error(`删除失败: ${response.data.msg}`);
        }
    } catch (error) {
        ElMessage.error(`删除失败: ${error.message}`);
    } finally {
        loading.close();
    }
};
// 批量操作相关方法
const enterBatchMode = () => {
    batchMode.value = true;
    selectedAudios.value = new Set();
};

const exitBatchMode = () => {
    batchMode.value = false;
    selectedAudios.value = new Set();
};

const handleBatchDelete = async () => {
    try {
        await ElMessageBox.confirm(`确定要删除选中的 ${selectedAudios.value.size} 个音频吗?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        });

        const loading = ElLoading.service({
            lock: true,
            text: `正在批量删除 ${selectedAudios.value.size} 个音频...`,
            background: 'rgba(0, 0, 0, 0.7)'
        });

        try {
            let successCount = 0;
            let failCount = 0;

            for (const id of selectedAudios.value) {
                try {
                    const response = await axios.delete(`/resource/${id}`);
                    if (response.data.code === 200) {
                        successCount++;
                    } else {
                        failCount++;
                        ElMessage.warning(`音频 ${id} 删除失败: ${response.data.msg}`);
                    }
                } catch (error) {
                    failCount++;
                    ElMessage.warning(`音频 ${id} 删除出错: ${error.message}`);
                }
            }

            if (failCount === 0) {
                ElMessage.success(`成功删除 ${successCount} 个音频`);
            } else {
                ElMessage.warning(`删除完成，成功 ${successCount} 个，失败 ${failCount} 个`);
            }

            await fetchAudios();
            exitBatchMode();
        } finally {
            loading.close();
        }
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(`批量删除失败: ${error.message}`);
        }
    }
};

// 批量移动确认
const confirmBatchMove = async () => {
    try {
        await ElMessageBox.confirm(
            `确定要将选中的 ${selectedAudios.value.size} 个音频移动到 ${availableCategories.value.find(c => c.id === moveTargetCategory.value)?.name || '目标分类'} 吗?`,
            '提示',
            {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }
        );

        const loading = ElLoading.service({
            lock: true,
            text: `正在批量移动 ${selectedAudios.value.size} 个音频...`,
            background: 'rgba(0, 0, 0, 0.7)'
        });

        try {
            // 修改接口请求，发送 ids 列表
            const response = await axios.put('/resource/move', {
                ids: Array.from(selectedAudios.value), // 将 Set 转换为数组
                new_category_id: moveTargetCategory.value,
            });

            if (response.data.code === 200) {
                ElMessage.success(`成功移动 ${selectedAudios.value.size} 个音频`);
            } else {
                ElMessage.error(`移动失败: ${response.data.msg}`);
            }

            await fetchAudios();
            showMoveDialog.value = false;
            exitBatchMode();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            ElMessage.error(`移动出错: ${errorMsg}`);
        } finally {
            loading.close();
        }
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error(`批量移动失败: ${error.message}`);
        }
    }
};
watch(() => props.categoryId, async () => {
    await fetchAudios();
    // 重置分页和筛选状态
    currentPage.value = 1;
    activeCategory.value = '全部';
    searchQuery.value = '';
}, { immediate: true });

// 初始化
onMounted(fetchAudios);
</script>

<style scoped>
.audio-gallery {
    padding: 20px;
}

.gallery-header {
    display: flex;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 20px;
    align-items: center;
}

.upload-button {
    padding: 8px 16px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
}

.batch-actions {
    display: flex;
    gap: 10px;
}

.batch-button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.batch-button:not(.cancel) {
    background: #f56c6c;
    color: white;
}

.batch-button.cancel {
    background: #f0f0f0;
}

.batch-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.normal-actions {
    display: flex;
}

.audio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.audio-card-wrapper {
    position: relative;
}

.audio-checkbox {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    width: 18px;
    height: 18px;
    cursor: pointer;
}
</style>