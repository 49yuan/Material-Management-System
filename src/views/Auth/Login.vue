<template>
    <div class="login-page">
        <div class="login-container animate__animated animate__fadeIn">
            <div class="login-header">
                <h1 class="title">素材管理系统</h1>
                <p class="subtitle">高效管理您的数字资产</p>
            </div>

            <div class="login-card animate__animated animate__fadeInUp">
                <form @submit.prevent="handleLogin">
                    <div class="form-group">
                        <label for="workNumber">工号</label>
                        <input id="workNumber" v-model="workNumber" type="text" placeholder="请输入工号" required
                            class="input-field">
                    </div>

                    <div class="form-group">
                        <label for="password">密码</label>
                        <input id="password" v-model="password" type="password" placeholder="请输入密码" required
                            class="input-field">
                    </div>

                    <button type="submit" class="login-button" :disabled="loading">
                        <span v-if="!loading">登录</span>
                        <span v-else class="loading-spinner"></span>
                    </button>

                    <div class="login-footer">
                        <span>还没有账号? <router-link to="/register" class="register-link">立即注册</router-link></span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import 'animate.css'

const authStore = useAuthStore()
const router = useRouter()
const workNumber = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
    loading.value = true
    try {
        const userform = {
            username: workNumber.value,
            password: password.value
        }
        const success = await authStore.login(userform)
        if (success) {
            router.push('/dashboard')
        }
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.login-container {
    width: 100%;
    max-width: 420px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding: 40px;
}

.login-header {
    text-align: center;
    margin-bottom: 30px;
}

.title {
    font-size: 28px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
}

.subtitle {
    font-size: 14px;
    color: #7f8c8d;
}

.login-card {
    background: white;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
}

.input-field {
    width: 92%;
    padding: 12px 15px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.3s;
}

.input-field:focus {
    outline: none;
    border-color: #42b983;
    box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.login-button {
    width: 100%;
    padding: 12px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s;
    margin-top: 10px;
}

.login-button:hover {
    background: #3aa876;
}

.login-button:disabled {
    background: #a0d9bb;
    cursor: not-allowed;
}

.loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.login-footer {
    margin-top: 20px;
    font-size: 14px;
    color: #7f8c8d;
    text-align: center;
}

.forgot-password {
    display: block;
    margin-bottom: 10px;
    color: #42b983;
    text-decoration: none;
}

.register-link {
    color: #42b983;
    font-weight: 500;
    text-decoration: none;
}

.register-link:hover {
    text-decoration: underline;
}
</style>