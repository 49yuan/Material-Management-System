<template>
    <div class="video-gallery">
        <div class="gallery-header">
            <CategoryFilter :categories="categories" :active-category="activeCategory"
                @category-change="handleCategoryChange" />
            <SearchBar v-model="searchQuery" @search="handleSearch" />
            <button v-if="authStore.isAdmin" class="upload-button" @click="showUploadForm = true">
                上传视频
            </button>
        </div>

        <VideoUploadForm v-if="showUploadForm" @submit="handleUpload" @cancel="showUploadForm = false" />

        <div class="video-grid">
            <VideoCard v-for="video in paginatedVideos" :key="video.id" :video-url="video.url" :video-name="video.name"
                :video-id="video.id" :is-admin="authStore.isAdmin" :tag="video.tag" @edit="handleEditVideo"
                @delete="handleDeleteVideo" />
        </div>

        <PaginationControls :current-page="currentPage" :total-pages="totalPages" @page-change="handlePageChange" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElLoading, ElMessage } from 'element-plus';
import axios from 'axios';
import VideoCard from '@/components/materials/VideoCard.vue';
import VideoUploadForm from '@/components/materials/VideoUploadForm.vue';
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
const videos = ref([]);
const searchQuery = ref('');
const activeCategory = ref('全部');
const currentPage = ref(1);
const pageSize = 12;
const showUploadForm = ref(false);

// 获取视频数据
const fetchVideos = async () => {
    try {
        const response = await axios.get(`/resource/${props.categoryId}/video`);
        if (response.data?.code === 200) {
            videos.value = response.data.data.content.map(item => ({
                id: item.id,
                url: item.url,
                name: item.name,
                type: item.type,
                category_id: item.category_id,
                tag: Array.isArray(item.tag) ? item.tag : []
            }));
        } else {
            console.error('获取视频失败:', response.data?.msg);
        }
    } catch (error) {
        console.error('获取视频失败:', error);
    }
};

// 计算属性
const categories = computed(() => {
    const allTags = videos.value.flatMap(video => video.tag);
    return ['全部', ...new Set(allTags)];
});

const filteredVideos = computed(() => {
    let result = videos.value;

    // 分类筛选
    if (activeCategory.value !== '全部') {
        result = result.filter(video =>
            video.tag.includes(activeCategory.value)
        );
    }

    // 搜索筛选
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(video =>
            (video.name && video.name.toLowerCase().includes(query)) ||
            video.tag.some(tag => tag.toLowerCase().includes(query))
        );
    }

    return result;
});

const totalPages = computed(() =>
    Math.ceil(filteredVideos.value.length / pageSize)
);

const paginatedVideos = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredVideos.value.slice(start, end);
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

// 上传视频
const handleUpload = async (formData) => {
    const loading = ElLoading.service({
        lock: true,
        text: '视频上传中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        formData.append('category_id', props.categoryId);
        formData.append('type', 'video');

        const response = await axios.post('/resource', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200) {
            ElMessage.success('上传成功！');
            await fetchVideos();
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

// 编辑视频
const handleEditVideo = async (id, newData) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在更新视频信息...',
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
            await fetchVideos();
        } else {
            ElMessage.error(`更新失败: ${response.data.msg}`);
            return Promise.reject(response.data.msg);
        }
    } catch (error) {
        ElMessage.error(`更新失败: ${error.message}`);
        return Promise.reject(error);
    } finally {
        loading.close();
    }
};

// 删除视频
const handleDeleteVideo = async (id) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在删除视频...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const response = await axios.delete(`/resource/${id}`);
        if (response.data.code === 200) {
            ElMessage.success('删除成功！')
            await fetchVideos();
        } else {
            ElMessage.error(`删除失败: ${response.data.msg}`);
            return Promise.reject();
        }
    } catch (error) {
        ElMessage.error(`删除失败: ${error.message}`);
        return Promise.reject();
    } finally {
        loading.close();
    }
};

// 初始化
onMounted(fetchVideos);
</script>

<style scoped>
.video-gallery {
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

.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}
</style>