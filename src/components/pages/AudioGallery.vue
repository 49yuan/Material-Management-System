<template>
    <div class="audio-gallery">
        <div class="gallery-header">
            <CategoryFilter :categories="categories" :active-category="activeCategory"
                @category-change="handleCategoryChange" />
            <SearchBar v-model="searchQuery" @search="handleSearch" />
            <button v-if="authStore.isAdmin" class="upload-button" @click="showUploadForm = true">
                上传音频
            </button>
        </div>

        <AudioUploadForm v-if="showUploadForm" @submit="handleUpload" @cancel="showUploadForm = false" />

        <div class="audio-grid">
            <AudioCard v-for="audio in paginatedAudios" :key="audio.id" :audio-url="audio.url" :audio-name="audio.name"
                :audio-id="audio.id" :is-admin="authStore.isAdmin" :tag="audio.tag" @edit="handleEditAudio"
                @delete="handleDeleteAudio" />
        </div>

        <PaginationControls :current-page="currentPage" :total-pages="totalPages" @page-change="handlePageChange" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElLoading, ElMessage } from 'element-plus';
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
const pageSize = 30;
const showUploadForm = ref(false);

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
}

.audio-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}
</style>