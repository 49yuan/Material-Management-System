import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios';

const staticRoutes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/resetPassword',
    name: 'ResetPassword',
    component: () => import('@/views/Auth/ResetPassword.vue'),
    meta: { requiresAuth: false }
  }
]

const base = process.env.NODE_ENV === 'production' ? '/material-system/' : '/';

const router = createRouter({
  history: createWebHistory(base),
  routes: staticRoutes
})
const CategoryLayout = () => import('@/views/CategoryLayout.vue')
// 从后端加载分类路由
export const loadCategoryRoutes = async () => {
  try {
    const response = await axios.get('/category');

    response.data.data.forEach(category => {
      const basePath = `/${encodeURIComponent(category.name.toLowerCase())}`;

      router.addRoute({
        path: basePath,
        name: category.name,
        redirect: `${basePath}/text`,
        component: CategoryLayout,
        meta: {
          requiresAuth: true,
          icon: '📁',
          title: category.name,
          isCategory: true,
          category_id: category.id
        },
        children: [
          {
            path: 'text',
            name: `${category.name}Text`,
            component: () => import('@/views/Category/TextView.vue'),
            meta: { title: '文章', icon: '📄' }
          },
          {
            path: 'image',
            name: `${category.name}Image`,
            component: () => import('@/views/Category/ImageView.vue'),
            meta: { title: '图片', icon: '🖼️' }
          },
          {
            path: 'video',
            name: `${category.name}Video`,
            component: () => import('@/views/Category/VideoView.vue'),
            meta: { title: '视频', icon: '🎬' }
          },
          {
            path: 'audio',
            name: `${category.name}Audio`,
            component: () => import('@/views/Category/AudioView.vue'),
            meta: { title: '音频', icon: '🎵' }
          }
        ]
      });
    });
  } catch (error) {
    console.error('加载分类路由失败:', error);
  }
};

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next('/login')
    }

    // 如果是首次加载且需要分类路由
    if (!authStore.routesLoaded) {
      await loadCategoryRoutes()
      authStore.setRoutesLoaded(true)
      return next(to.fullPath) // 重新导航到目标路由
    }
  }

  next()
})

export default router