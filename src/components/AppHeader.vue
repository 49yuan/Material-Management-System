<template>
    <header class="app-header">
        <div class="logo"></div>
        <div class="user-info" v-if="authStore.isAuthenticated">
            <el-dropdown @command="handleCommand">
                <div class="user-avatar-container">
                    <span class="username">{{ authStore.user?.username }}</span>
                    <div class="user-avatar">
                        <!-- 白色用户图标 -->
                        <el-icon :size="24">
                            <Avatar />
                        </el-icon>
                    </div>
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item command="resetPassword">
                            <el-icon>
                                <Edit />
                            </el-icon>
                            修改密码
                        </el-dropdown-item>
                        <el-dropdown-item command="logout">
                            <el-icon>
                                <Remove />
                            </el-icon>
                            退出登录
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { Edit, Remove, Avatar } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const router = useRouter()

const handleCommand = (command) => {
    if (command === 'resetPassword') {
        navigateToResetPassword()
    } else if (command === 'logout') {
        handleLogout()
    }
}

// 修改密码导航
const navigateToResetPassword = () => {
    router.push('/resetPassword')
}

// 退出登录
const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<style scoped>
.app-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 60px;
    padding: 0 2rem;
    background: #2c3e50;
    color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.logo {
    font-size: 1.5rem;
    font-weight: bold;
    color: #42b983;
}

.user-info {
    display: inline-block;
    position: relative;
}

.user-avatar-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    position: relative;
    color: rgb(225, 225, 225);
    padding: 0 8px;
}

.username {
    font-size: 1rem;
    font-weight: 500;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.3s;
}

.user-avatar:hover {
    background-color: rgba(255, 255, 255, 0.3);
}

.user-icon,
.edit-icon,
.logout-icon {
    width: 24px;
    height: 24px;
}
</style>