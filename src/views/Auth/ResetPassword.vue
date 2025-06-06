<template>
    <div class="change-password-page">
        <div class="change-password-container animate__animated animate__fadeIn">
            <div class="change-password-header">
                <h1 class="title">修改密码</h1>
                <p class="subtitle">请确保新密码的安全性</p>
            </div>

            <div class="change-password-card animate__animated animate__fadeInUp">
                <form @submit.prevent="handleChangePassword">
                    <div class="form-group">
                        <label for="oldPassword">当前密码</label>
                        <input id="oldPassword" v-model="form.old_password" type="password" placeholder="请输入当前密码" required
                            class="input-field">
                    </div>

                    <div class="form-group">
                        <label for="newPassword">新密码</label>
                        <input id="newPassword" v-model="form.new_password" type="password" placeholder="请输入新密码" required
                            class="input-field">
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">确认新密码</label>
                        <input id="confirmPassword" v-model="confirmPassword" type="password" placeholder="请再次输入新密码"
                            required class="input-field" :class="{ 'error': passwordMismatch }">
                        <span v-if="passwordMismatch" class="error-message">两次输入的新密码不一致</span>
                    </div>

                    <button type="submit" class="change-password-button" :disabled="loading || passwordMismatch">
                        <span v-if="!loading">确认修改</span>
                        <span v-else class="loading-spinner"></span>
                    </button>
                    <div class="change-password-footer">
                        <router-link to="/dashboard" class="back-link">返回首页</router-link>
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
import { useAuthStore } from '@/stores/auth'
import 'animate.css'

const authStore = useAuthStore()
const router = useRouter()

const form = ref({
    old_password: '',
    new_password: ''
})

const confirmPassword = ref('')
const loading = ref(false)

const passwordMismatch = computed(() => {
    return form.value.new_password && confirmPassword.value &&
        form.value.new_password !== confirmPassword.value
})

const handleChangePassword = async () => {
    if (passwordMismatch.value) return

    loading.value = true

    try {
        const response = await axios.put('/user', {
            old_password: form.value.old_password,
            new_password: form.value.new_password
        })

        if (response.data.code === 200) {
            ElMessage.success('密码修改成功，请重新登录')
            // 修改成功后退出登录
            authStore.logout()
            router.push('/login')
        } else {
            ElMessage.error(response.data.msg || '密码修改失败')
        }
    } catch (error) {
        ElMessage.error(error.response?.data?.msg || '密码修改失败')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
.change-password-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 20px;
}

.change-password-container {
    width: 100%;
    max-width: 480px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    padding: 40px;
}

.change-password-header {
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

.change-password-card {
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
    width: 95%;
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

.change-password-button {
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

.change-password-button:hover {
    background: #3aa876;
}

.change-password-button:disabled {
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

.change-password-footer {
    margin-top: 20px;
    font-size: 14px;
    color: #7f8c8d;
    text-align: center;
}

.back-link {
    color: #42b983;
    font-weight: 500;
    text-decoration: none;
}

.back-link:hover {
    text-decoration: underline;
}
</style>