<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo-container">
        <router-link to="/">
          <img src="@/assets/logo.png" alt="留学者指南 Logo" class="logo" />
          <h2 v-if="!isCollapse" class="logo-text">留学者指南</h2>
        </router-link>
      </div>
      
      <el-menu
        router
        :default-active="activeMenu"
        class="sidebar-menu"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        :collapse="isCollapse"
      >
        <el-menu-item v-for="menu in navMenus" :key="menu.path" :index="menu.path">
          <el-icon><component :is="menu.icon" /></el-icon>
          <template #title>{{ menu.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="toggle-btn" @click="toggleSidebar">
            <Menu />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
          
          <div v-if="config.api.useMockData" class="demo-tag">
            <el-tag type="success" effect="dark" size="small">演示模式</el-tag>
          </div>
        </div>
        
        <div class="header-right">
          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" :src="userAvatar" />
              <span class="username">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/profile')">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
      
      <!-- 页脚 -->
      <el-footer height="50px" class="footer">
        <div class="footer-content">
          <span>© {{ currentYear }} 留学者指南</span>
          <span>|</span>
          <span>让留学申请更简单</span>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Document, School, Collection, ChatDotRound, User, ArrowDown, SwitchButton, Menu } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { useMockAuthStore } from '@/stores/mockAuth' 
import { config } from '@/config'
import defaultAvatar from '@/assets/default-avatar.png'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const mockAuthStore = useMockAuthStore()

// 获取合适的认证存储
const store = computed(() => {
  return config.api.useMockData ? mockAuthStore : authStore
})

// 用户信息
const user = computed(() => store.value.user)
const isAuthenticated = computed(() => store.value.isAuthenticated)

// 计算当前年份
const currentYear = computed(() => new Date().getFullYear())

// 用户信息
const userName = computed(() => user.value?.fullName || '用户')
const userAvatar = computed(() => user.value?.profilePicture || defaultAvatar)

// 展开/收起侧边栏
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 获取当前路由的标题
const currentTitle = computed(() => {
  return route.meta.title || '留学者指南'
})

// 获取当前激活的菜单项
const activeMenu = computed(() => {
  // 根据当前路由路径确定活动菜单
  const { path } = route
  if (path.startsWith('/essay')) return '/essay'
  if (path.startsWith('/schools')) return '/schools'
  return path
})

// 处理登出
const handleLogout = () => {
  store.value.logout()
    router.push('/auth/login')
  }

// 导航菜单
const navMenus = [
  {
    path: '/dashboard',
    title: '首页',
    icon: 'House'
  },
  {
    path: '/essay',
    title: '我的文书',
    icon: 'Document'
  },
  {
    path: '/recommendation',
    title: '院校推荐',
    icon: 'School'
  },
  {
    path: '/schools',
    title: '院校库',
    icon: 'Collection'
  },
  {
    path: '/forum',
    title: '申请论坛',
    icon: 'ChatDotRound'
  }
]

// 组件挂载时
onMounted(() => {
  // 如果使用模拟数据且用户未登录，尝试加载模拟用户
  if (config.api.useMockData && !isAuthenticated.value && localStorage.getItem('mockToken')) {
    mockAuthStore.loadUser()
  }
})
</script>

<style scoped lang="scss">
.app-container {
  height: 100vh;
  display: flex;
  overflow: hidden;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  
  &::-webkit-scrollbar {
    display: none;
  }
}
  
  .logo-container {
    height: 64px;
  padding: 0 15px;
    display: flex;
    align-items: center;
  justify-content: center;
    
    a {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    
    .logo {
    width: 30px;
    height: 30px;
    }
    
    .logo-text {
    margin-left: 10px;
    color: #fff;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .sidebar-menu {
    border-right: none;
}

.main-container {
  flex: 1;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
  
  .header-left {
    display: flex;
    align-items: center;
    
    .toggle-btn {
      font-size: 20px;
      cursor: pointer;
      margin-right: 20px;
      &:hover {
        color: #409EFF;
      }
    }
    
    .demo-tag {
      margin-left: 16px;
    }
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    
    .username {
      margin: 0 8px;
      color: #303133;
    }
  }
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}

.footer {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-top: 1px solid #e6e6e6;
  
  .footer-content {
    display: flex;
    align-items: center;
    
    span {
      margin: 0 5px;
      color: #606266;
      font-size: 12px;
    }
  }
}
</style> 