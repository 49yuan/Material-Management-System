<template>
    <header class="app-header">
        <div class="logo"></div>
        <div class="user-info" v-if="authStore.isAuthenticated">
            <div class="user-avatar-container">
                <span class="username">{{ authStore.user?.username }}</span>
                <div class="user-avatar">
                    <!-- 白色用户图标 -->
                    <svg class="user-icon" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" />
                        <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" />
                    </svg>
                </div>
            </div>
            <ul class="dropdown-menu">
                <li class="dropdown-item" @click="navigateToResetPassword">
                    <svg class="edit-icon" viewBox="0 0 20 20" fill="#2c3e50" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M1014.642 150.772c-7.923 28.292-14.956 54.581-34.507 70.42-171.054 138.593-308.162 310.68-463.298 464.871-4.074 4.061-8.949 7.641-11.991 12.379-65.929 102.828-181.262 115.945-282.196 154.651-21.67 8.3-55.57-30.316-49.069-53.263 18.317-64.627 36.254-129.378 55.954-193.592 3.332-10.863 13.737-20.27 22.483-28.673 147.544-141.694 295.884-282.56 442.692-425.014 35.012-33.975 65.363-72.802 97.388-109.813 43.243-49.963 103.691-53.987 150.811-7.654 28.364 27.89 62.838 52.147 69.349 96.114 0.846 5.7 1.756 11.387 2.64 17.076 2.149 1.29-2.409 1.207-0.257 2.497v0zM746.265 198.034c-143.031 143.31-285.798 286.353-425.513 426.335 24.065 24.382 50.698 51.374 73.962 74.938 142.838-139.748 286.956-280.736 430.361-421.026-29.209-29.747-55.809-56.826-78.809-80.248v0zM780.431 137.468c35.534 34.035 66.499 63.695 103.078 98.73 6.533-8.912 12.87-19.914 21.406-28.782 61.69-64.018 61.828-63.88-3.146-125.401-1.389-1.318-2.658-2.784-4.08-4.063-17.97-16.119-36.193-16.301-53.943-0.005-20.473 18.801-40.525 38.055-63.316 59.521v0zM250.913 775.782c32.921-13.26 58.889-23.713 81.104-32.654-17.064-20.07-32.667-38.427-51.038-60.045-10.237 31.532-18.925 58.35-30.067 92.699v0zM457.325 1010.618c-95.18 0-190.363 0.146-285.55-0.065-52.12-0.109-98.169-14.202-133.136-56.247-23.055-27.724-29.593-59.946-29.642-94.142-0.291-189.403-1.034-378.814 0.219-568.217 0.664-101.677 63.442-162.274 165.278-162.868 102.874-0.599 205.757-0.022 308.627-0.226 22.538-0.043 44.021 1.736 46.9 30.199 2.109 20.825-14.922 31.334-48.338 31.361-99.987 0.084-199.985-0.147-299.974 0.094-71.519 0.181-112.147 41.233-112.165 112.856-0.072 182.666-0.089 365.333-0.043 547.999 0.01 56.514 38.085 96.863 95.137 97.074 195.173 0.735 390.353 0.596 585.525 0.129 46.174-0.104 76.086-33.055 76.29-83.051 0.51-124.969 0.241-249.947 0.433-374.927 0.017-9.542-2.207-21.578 2.57-28.067 8.038-10.926 21.765-26.173 31.426-25.058 10.109 1.164 19.003 18.963 26.809 30.577 2.697 4.002 0.62 11.255 0.62 17.019 0.011 124.028 0.17 248.059-0.049 372.085-0.182 104.429-49.419 153.352-154.028 153.468-92.305 0.096-184.61 0.022-276.91 0.011v0zM457.325 1010.618z"
                            fill="" p-id="7418"></path>
                    </svg>
                    修改密码
                </li>
                <li class="dropdown-item" @click="handleLogout">
                    <svg class="logout-icon" viewBox="0 0 20 20" fill="#2c3e50" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M726.437647 451.764706L623.856941 349.123765a36.141176 36.141176 0 1 1 51.2-51.07953l163.117177 163.237647a36.020706 36.020706 0 0 1 0.602353 52.705883l-163.779765 163.779764a36.141176 36.141176 0 0 1-51.07953-51.139764L726.437647 524.047059H320.873412a36.141176 36.141176 0 0 1 0-72.282353h405.564235zM192.752941 903.529412h502.723765v-87.100236a36.141176 36.141176 0 0 1 72.282353 0V939.670588a36.141176 36.141176 0 0 1-36.141177 36.141177H156.611765a36.141176 36.141176 0 0 1-36.141177-36.141177V36.141176A36.141176 36.141176 0 0 1 156.611765 0h575.006117a36.141176 36.141176 0 0 1 36.141177 36.141176v123.181177a36.141176 36.141176 0 0 1-72.282353 0V72.282353H192.752941V903.529412z"
                            fill="#2c2c2c" p-id="6382"></path>
                    </svg>
                    退出登录
                </li>
            </ul>
        </div>
    </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()


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
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.user-avatar-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    position: relative;
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

.dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 8px 0;
    list-style: none;
    z-index: 1000;
    width: 150px;
    margin-top: 8px;
    display: none;
}

.user-info:hover .dropdown-menu {
    display: block;
}

.dropdown-item {
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333;
    cursor: pointer;
    transition: background-color 0.3s;
}

.dropdown-item:hover {
    background-color: #f0f0f0;
}
</style>