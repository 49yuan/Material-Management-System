<template>
    <div class="register-page">
        <div class="register-container animate__animated animate__fadeIn">
            <div class="register-header">
                <h1 class="title">用户注册</h1>
                <p class="subtitle">创建您的管理员账户</p>
            </div>

            <div class="register-card animate__animated animate__fadeInUp">
                <form @submit.prevent="handleRegister">
                    <div class="form-group">
                        <label for="username">用户名</label>
                        <input id="username" v-model="form.username" type="text" placeholder="请输入用户名" required
                            class="input-field">
                    </div>

                    <div class="form-group">
                        <label for="password">密码</label>
                        <input id="password" v-model="form.password" type="password" placeholder="请输入密码" required
                            class="input-field">
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">确认密码</label>
                        <input id="confirmPassword" v-model="form.confirmPassword" type="password" placeholder="请再次输入密码"
                            required class="input-field" :class="{ 'error': passwordMismatch }">
                        <span v-if="passwordMismatch" class="error-message">两次输入的密码不一致</span>
                    </div>

                    <div class="role-selection">
                        <label>用户角色</label>
                        <div class="role-options">
                            <label class="role-option">
                                <input type="radio" v-model="form.is_admin" :value="true">
                                <span class="role-label">管理员</span>
                            </label>
                            <label class="role-option">
                                <input type="radio" v-model="form.is_admin" :value="false">
                                <span class="role-label">普通用户</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" class="register-button" :disabled="loading || passwordMismatch">
                        <span v-if="!loading">注册</span>
                        <span v-else class="loading-spinner"></span>
                    </button>
                    <div class="register-footer">
                        <span>已有账号? <router-link to="/login" class="login-link">立即登录</router-link></span>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentInstance } from 'vue'
import 'animate.css'

const { $http } = getCurrentInstance().appContext.config.globalProperties
const router = useRouter()

const form = ref({
    username: '',
    password: '',
    confirmPassword: '',
    is_admin: false,
    is_subadmin: true
})

const loading = ref(false)

const passwordMismatch = computed(() => {
    return form.value.password && form.value.confirmPassword &&
        form.value.password !== form.value.confirmPassword
})

const handleRegister = async () => {
    if (passwordMismatch.value) return

    loading.value = true

    try {
        const response = await $http.post('/user/create', {
            username: form.value.username,
            password: form.value.password,
            is_admin: form.value.is_admin,
            is_subadmin: true
        })
        if (response.data.code === 200) {
            router.push('/login')
        } else if (response.data.code === 412) {
            ElMessage.error("用户名重复")
        } else {
            ElMessage.error(response.data.msg)
        }
    } catch (error) {
        ElMessage.error(error.message)
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.register-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.register-container {
    width: 100%;
    max-width: 480px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding: 40px;
}

.register-header {
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

.register-card {
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
    width: 100%;
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

.input-field.error {
    border-color: #f56c6c;
}

.error-message {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 5px;
    display: block;
}

.role-selection {
    margin-bottom: 20px;
}

.role-selection label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #34495e;
    font-weight: 500;
}

.role-options {
    display: flex;
    gap: 20px;
}

.role-option {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.role-option input {
    margin-right: 8px;
}

.role-label {
    font-size: 14px;
    color: #34495e;
}

.checkbox-option {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #34495e;
    cursor: pointer;
}

.checkbox-option input {
    margin-right: 8px;
}

.register-button {
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
    margin-top: 20px;
}

.register-button:hover {
    background: #3aa876;
}

.register-button:disabled {
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

.register-footer {
    margin-top: 20px;
    font-size: 14px;
    color: #7f8c8d;
    text-align: center;
}

.login-link {
    color: #42b983;
    font-weight: 500;
    text-decoration: none;
}

.login-link:hover {
    text-decoration: underline;
}
</style>