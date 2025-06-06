<template>
    <div class="image-gallery">
        <div class="gallery-header">
            <CategoryFilter :categories="categories" :active-category="activeCategory"
                @category-change="handleCategoryChange" />
            <SearchBar v-model="searchQuery" @search="handleSearch" />
            <button v-if="authStore.isAdmin" class="upload-button" @click="showUploadForm = true">
                上传图片
            </button>
        </div>

        <ImageUploadForm v-if="showUploadForm" @submit="handleUpload" @cancel="showUploadForm = false" />

        <div class="image-grid">
            <ImageCard v-for="image in paginatedImages" :key="image.id" :image-url="image.url" :image-name="image.name"
                :image-id="image.id" :is-admin="authStore.isAdmin" :tag="image.tag" @edit="handleEditImage"
                @delete="handleDeleteImage" />
        </div>

        <PaginationControls :current-page="currentPage" :total-pages="totalPages" @page-change="handlePageChange" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElLoading, ElMessage } from 'element-plus';
import axios from 'axios';
import ImageCard from '@/components/materials/ImageCard.vue';
import ImageUploadForm from '@/components/materials/ImageUploadForm.vue';
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
const images = ref([]);
const searchQuery = ref('');
const activeCategory = ref('全部');
const currentPage = ref(1);
const pageSize = 20;
const showUploadForm = ref(false);
// 获取图片数据
const fetchImages = async () => {
    try {
        const response = await axios.get(`/resource/${props.categoryId}/image`);
        // 确保正确处理返回的数据结构
        if (response.data?.code === 200) {
            images.value = response.data.data.content.map(item => ({
                id: item.id,
                url: item.url,
                name: item.name,
                type: item.type,
                category_id: item.category_id,
                tag: Array.isArray(item.tag) ? item.tag : []
            }));
        } else {
            console.error('获取图片失败:', response.data?.msg);
        }
    } catch (error) {
        console.error('获取图片失败:', error);
    }
};

// 计算属性
const categories = computed(() => {
    const allTags = images.value.flatMap(img => img.tag);
    return ['全部', ...new Set(allTags)];
});

const filteredImages = computed(() => {
    let result = images.value;

    // 分类筛选
    if (activeCategory.value !== '全部') {
        result = result.filter(img =>
            img.tag.includes(activeCategory.value)
        );
    }

    // 搜索筛选
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(img =>
            (img.name && img.name.toLowerCase().includes(query)) ||
            img.tag.some(tag => tag.toLowerCase().includes(query))
        );
    }

    return result;
});

const totalPages = computed(() =>
    Math.ceil(filteredImages.value.length / pageSize));

const paginatedImages = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    return filteredImages.value.slice(start, end);
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

// 上传图片
const handleUpload = async (formData) => {
    const loading = ElLoading.service({
        lock: true,
        text: '图片上传中，请稍候...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        formData.append('category_id', props.categoryId);
        formData.append('type', 'image');

        const response = await axios.post('/resource', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200) {
            ElMessage.success('上传成功！');
            await fetchImages();
            showUploadForm.value = false;
        } else {
            ElMessage.error(`上传失败: ${response.data.msg}`);
        }
    } catch (error) {
        ElMessage.error(`上传失败: ${error.message}`);
    } finally {
        loading.close();  // 无论成功失败，关闭加载状态
    }
};
// 编辑图片
const handleEditImage = async (id, newData) => {
    return new Promise(async (resolve, reject) => {
        const loading = ElLoading.service({
            lock: true,
            text: '正在更新图片信息...',
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
                await fetchImages();
                resolve(); // 成功时调用 resolve
            } else {
                ElMessage.error(`更新失败: ${response.data.msg}`);
                reject(response.data.msg); // 失败时调用 reject
            }
        } catch (error) {
            ElMessage.error(`更新失败: ${error.message}`);
            reject(error); // 捕获错误时调用 reject
        } finally {
            loading.close();
        }
    });
};

// 删除图片
const handleDeleteImage = async (id) => {
    const loading = ElLoading.service({
        lock: true,
        text: '正在删除图片...',
        background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
        const response = await axios.delete(`/resource/${id}`);
        if (response.data.code === 200) {
            ElMessage.success('删除成功！');
            await fetchImages();
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
onMounted(fetchImages);
</script>
<style scoped>
.image-gallery {
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

.image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}
</style>