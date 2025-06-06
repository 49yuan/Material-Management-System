<template>
  <div id="app">
    <AppHeader v-if="!isAuthPage" />
    <div class="app-container">
      <Sidebar v-if="!isAuthPage" />
      <main class="main-content" :class="{ 'full-screen': isAuthPage }">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import Sidebar from '@/components/Sidebar.vue'

const route = useRoute()
const authStore = useAuthStore()

const isAuthPage = computed(() => {
  return ['Login', 'Register', 'ResetPassword'].includes(route.name)
})
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
}

.app-container {
  display: flex;
  flex: 1;
}

.main-content {
  flex: 1;
  margin-top: 60px;
  margin-left: 250px;
  padding: 20px;
}

.main-content.full-screen {
  margin-top: 0;
  margin-left: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
</style>