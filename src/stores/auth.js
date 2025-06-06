import { defineStore } from 'pinia'
import { ElMessage } from 'element-plus'
import router from '@/router'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { loadCategoryRoutes } from '@/router/index.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(sessionStorage.getItem('user')) || null,
        token: sessionStorage.getItem('token') || null,
        isAuthenticated: !!sessionStorage.getItem('token'),
        routesLoaded: false
    }),
    actions: {
        async login(credentials) {
            try {
                // 第一步：登录获取token
                const loginRes = await axios.post('/user/login', {
                    username: credentials.username,
                    password: credentials.password
                });

                if (loginRes.data.code !== 200) {
                    throw new Error(loginRes.data.msg || '登录失败');
                }

                const token = loginRes.data.data.token;
                this.token = token;
                sessionStorage.setItem('token', token);

                // 更新 axios 的全局配置
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // 第二步：获取用户信息
                const userInfo = await this.fetchUser();
                if (!userInfo) throw new Error('获取用户信息失败');

                this.isAuthenticated = true;
                this.routesLoaded = false;

                // 加载分类路由
                await loadCategoryRoutes();

                this.routesLoaded = true;

                ElMessage.success('登录成功');
                router.push('/dashboard');
                return true;
            } catch (error) {
                console.error('Login error:', error);
                ElMessage.error(error.message || '登录失败');
                this.logout();
                return false;
            }
        },

        async fetchUser() {
            if (!this.token) return null

            try {
                const userInfoRes = await axios.get('/user')

                // 根据您的API响应结构调整
                if (userInfoRes.data.code !== 200) {
                    throw new Error(userInfoRes.data.msg || '获取用户信息失败')
                }

                const userInfo = userInfoRes.data.data
                this.user = userInfo
                sessionStorage.setItem('user', JSON.stringify(userInfo))
                return userInfo
            } catch (error) {
                console.error('Fetch user error:', error);
                this.logout()
                return null
            }
        },

        async register(userData) {
            try {
                const res = await axios.post('/user/register', userData)

                if (res.data.code !== 200) {
                    throw new Error(res.data.msg || '注册失败')
                }

                ElMessage.success('注册成功')
                return true
            } catch (error) {
                console.error('Register error:', error)
                ElMessage.error(error.message || '注册失败')
                return false
            }
        },

        logout() {
            this.user = null
            this.token = null
            this.isAuthenticated = false
            this.routesLoaded = false
            // 清除 sessionStorage
            sessionStorage.removeItem('token')
            sessionStorage.removeItem('user')
            // 跳转到登录页
            router.push('/login')
        },
        setRoutesLoaded(status) {
            this.routesLoaded = status
        }
    },
    getters: {
        isAdmin: (state) => state.user?.is_admin === 1
    }
})