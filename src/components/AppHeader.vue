<template>
    <header class="app-header">
        <div class="logo"></div>
        <div class="user-info" v-if="authStore.isAuthenticated">
            <span>{{ authStore.user?.username }}</span>
            <span v-if="authStore.isAdmin">(管理员)</span>
            <button @click="handleLogout">退出</button>
        </div>
    </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

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
    /* 固定高度 */
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
    display: flex;
    align-items: center;
    gap: 1rem;
}

button {
    padding: 0.5rem 1rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
        background: darken(#e74c3c, 10%);
    }
}
</style>