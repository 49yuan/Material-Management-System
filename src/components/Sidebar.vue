<template>
    <div class="sidebar">
        <div class="logo">D02装备</div>
        <ul class="nav-links">
            <!-- 动态加载分类 -->
            <li v-for="category in categories" :key="category.name" class="category-item">
                <div class="category-header" @click="toggleCategory(category.name)">
                    <span class="icon">📁</span>
                    <span class="title">{{ category.name }}</span>
                    <span class="arrow">
                        {{ expandedCategories[category.name] ? '▼' : '▶' }}
                    </span>
                </div>
                <ul v-show="expandedCategories[category.name]" class="sub-items">
                    <li>
                        <router-link :to="`/${category.path}/text`">
                            <span class="icon">📄</span>
                            <span class="title">文章</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link :to="`/${category.path}/image`">
                            <span class="icon">🖼️</span>
                            <span class="title">图片</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link :to="`/${category.path}/video`">
                            <span class="icon">🎬</span>
                            <span class="title">视频</span>
                        </router-link>
                    </li>
                    <li>
                        <router-link :to="`/${category.path}/audio`">
                            <span class="icon">🎵</span>
                            <span class="title">音频</span>
                        </router-link>
                    </li>
                </ul>
            </li>

            <li v-if="authStore.isAdmin">
                <button @click="showForm = true" class="add-btn">
                    <span class="icon">➕</span>
                    <span class="title">添加分类</span>
                </button>
            </li>
        </ul>

        <!-- 添加分类的表单 -->
        <div v-if="showForm" class="modal">
            <h3>添加新分类</h3>
            <form @submit.prevent="createNewCategory">
                <div class="form-group">
                    <label>分类名称:</label>
                    <input v-model="newCategory.name" placeholder="" required>
                </div>
                <div class="form-actions">
                    <button type="submit">创建</button>
                    <button type="button" @click="showForm = false">取消</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { computed, watch, getCurrentInstance } from 'vue';
import axios from 'axios';
import { loadCategoryRoutes } from '@/router/index.js';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { $http } = getCurrentInstance().appContext.config.globalProperties;

const showForm = ref(false);
const categories = ref([]);
const newCategory = ref({ name: '' });
const expandedCategories = ref({});
// 只有登录后才显示分类
const showCategories = computed(() => authStore.isAuthenticated)

const fetchCategories = async () => {
    if (!authStore.isAuthenticated) return;
    try {
        // 先加载路由
        await loadCategoryRoutes();
        const response = await axios.get('/category');
        categories.value = response.data.data.map(cat => ({
            ...cat,
            path: encodeURIComponent(cat.name.toLowerCase()),
            meta: { title: cat.name, icon: '📁' },
        }));
        initExpandedState();

        // 检查当前路由是否存在，如果不存在则重定向
        checkCurrentRoute();
        router.push(route.path);
    } catch (error) {
        console.error('获取分类失败:', error);
    }
};

const checkCurrentRoute = () => {
    const currentPath = route.path;
    const matchedRoute = router.resolve(currentPath);

    // 如果当前路由匹配不到，尝试重新加载后重定向
    if (matchedRoute.matched.length === 0 && currentPath !== '/') {
        // 重新加载路由后重定向
        loadCategoryRoutes().then(() => {
            router.push(currentPath).catch(() => {
                // 如果还是失败，重定向到首页
                router.push('/');
            });
        });
    }
};

const initExpandedState = () => {
    categories.value.forEach(category => {
        expandedCategories.value[category.name] = false;
    });

    // 根据当前路由展开对应的分类
    const currentPath = route.path;
    if (currentPath && currentPath !== '/') {
        const pathParts = currentPath.split('/');
        if (pathParts.length > 1) {
            const categoryName = decodeURIComponent(pathParts[1]);
            expandedCategories.value[categoryName] = true;
        }
    }
};

const createNewCategory = async () => {
    try {
        const response = await axios.post('/category', { name: newCategory.value.name });
        if (response.data.code === 200) {
            alert('分类创建成功');
            await loadCategoryRoutes();
            await fetchCategories();
        } else {
            alert('分类创建失败');
        }
    } catch (error) {
        console.error('创建分类失败:', error);
        alert('创建分类失败');
    } finally {
        showForm.value = false;
        newCategory.value = { name: '' };
    }
};

const toggleCategory = (category) => {
    expandedCategories.value[category] = !expandedCategories.value[category];
};
// 监听路由变化
watch(() => route.path, (newPath) => {
    if (newPath && newPath !== '/') {
        const pathParts = newPath.split('/');
        if (pathParts.length > 1) {
            const categoryName = decodeURIComponent(pathParts[1]);
            expandedCategories.value[categoryName] = true;
        }
    }
});

// 监听登录状态变化
watch(() => authStore.isAuthenticated, async (isAuth) => {
    if (isAuth) {
        await fetchCategories();
    }
});

// 初始化时如果已登录则加载
onMounted(async () => {
    if (authStore.isAuthenticated) {
        await fetchCategories();
    }
});
</script>

<style lang="less" scoped>
.sidebar {
    z-index: 1000;
    width: 250px;
    height: 100vh;
    background: #2c3e50;
    color: white;
    position: fixed;
    left: 0;
    top: 0;
    padding: 12px 0;
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;

    .logo {
        color: #42b983;
        font-size: 1.5rem;
        text-align: center;
        padding-bottom: 40px;
        font-weight: bold;
        flex-shrink: 0;
    }

    .nav-links {
        list-style: none;
        padding: 0;
        overflow-y: auto; // 只保留垂直滚动
        overflow-x: hidden; // 隐藏水平滚动
        flex-grow: 1; // 占据剩余空间
        max-height: calc(100vh - 100px); // 减去logo和padding的高度

        // 自定义滚动条样式
        &::-webkit-scrollbar {
            width: 6px;
        }

        &::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }

        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;

            &:hover {
                background: rgba(255, 255, 255, 0.3);
            }
        }

        li {
            margin: 5px 0;

            a,
            .add-btn {
                display: flex;
                align-items: center;
                color: white;
                text-decoration: none;
                padding: 10px 15px;
                border-radius: 4px;
                transition: all 0.3s;
                cursor: pointer;
                background: transparent;
                border: none;
                width: 100%;
                text-align: left;

                &:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                &.router-link-exact-active {
                    background: #42b983;
                    color: white;
                }

                .icon {
                    margin-right: 10px;
                    font-size: 1.2rem;
                }
            }
        }
    }

    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        color: #2c3e50;
        width: 80%;
        max-width: 400px;

        h3 {
            margin-top: 0;
            color: #42b983;
        }

        .form-group {
            margin-bottom: 15px;

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            input,
            textarea {
                width: 95%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            textarea {
                min-height: 100px;
            }
        }

        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;

            button {
                padding: 8px 15px;
                border: none;
                border-radius: 4px;
                cursor: pointer;

                &:first-child {
                    background: #42b983;
                    color: white;
                }

                &:last-child {
                    background: #f0f0f0;
                }
            }
        }
    }
}

.category-item {
    display: flex;
    flex-direction: column;
}

.category-header {
    display: flex;
    align-items: center;
    padding: 10px 15px;
    cursor: pointer;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .icon {
        margin-right: 10px;
    }
}

.sub-items {
    padding-left: 20px;
    list-style-type: none;

    li {
        margin: 0;
    }
}

.arrow {
    margin-left: auto;
    font-size: 12px;
}
</style>