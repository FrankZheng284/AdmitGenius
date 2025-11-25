import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupRouterGuards } from './guards'

// 导入布局组件
import MainLayout from '@/layouts/MainLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import TestView from '../views/test/TestView.vue'

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/DashboardView.vue'),
        meta: { title: '首页', icon: 'House', requiresAuth: true }
      },
      {
        path: 'essay',
        name: 'Essay',
        component: () => import('@/views/essay/EssayListView.vue'),
        meta: { title: '我的文书', icon: 'Document', requiresAuth: true }
      },
      {
        path: 'essay/create',
        name: 'EssayCreate',
        component: () => import('@/views/essay/EssayCreateView.vue'),
        meta: { title: '创建文书', icon: 'Edit', requiresAuth: true }
      },
      {
        path: 'essay/:id',
        name: 'EssayDetail',
        component: () => import('@/views/essay/EssayDetailView.vue'),
        meta: { title: '文书详情', requiresAuth: true }
      },
      {
        path: 'essay/edit/:id',
        name: 'EssayEdit',
        component: () => import('@/views/essay/EssayEditView.vue'),
        meta: { title: '编辑文书', requiresAuth: true }
      },
      {
        path: 'essay/polish/:id',
        name: 'EssayPolish',
        component: () => import('@/views/essay/EssayPolishView.vue'),
        meta: { title: '文书润色', requiresAuth: true }
      },
      {
        path: 'essay/view',
        name: 'EssayView',
        component: () => import('@/views/essay/EssayView.vue'),
        meta: { title: '文书管理', icon: 'Edit', requiresAuth: true }
      },
      {
        path: 'recommendation',
        name: 'Recommendation',
        component: () => import('@/views/recommendation/RecommendationView.vue'),
        meta: { title: '院校推荐', icon: 'School', requiresAuth: true }
      },
      {
        path: 'schools',
        name: 'Schools',
        component: () => import('@/views/school/SchoolListView.vue'),
        meta: { title: '院校库', icon: 'Collection', requiresAuth: true }
      },
      {
        path: 'schools/:id',
        name: 'SchoolDetail',
        component: () => import('@/views/school/SchoolDetailView.vue'),
        meta: { title: '院校详情', requiresAuth: true }
      },
      {
        path: 'forum',
        name: 'Forum',
        component: () => import('@/views/forum/ForumView.vue'),
        meta: { title: '申请论坛', icon: 'ChatDotRound', requiresAuth: true }
      },
      {
        path: 'forum/post/:id',
        name: 'ForumPost',
        component: () => import('@/views/forum/ForumPostView.vue'),
        meta: { title: '帖子详情', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/ProfileView.vue'),
        meta: { title: '个人中心', icon: 'User', requiresAuth: true }
      },
      {
        path: 'user/:id',
        name: 'UserProfile',
        component: () => import('@/views/user/UserProfileView.vue'),
        meta: { title: '用户主页', requiresAuth: true }
      }
    ]
  },
  {
    path: '/auth',
    component: AuthLayout,
    redirect: '/auth/login',
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue'),
        meta: { title: '登录' }
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue'),
        meta: { title: '注册' }
      },
      {
        path: 'register-expert',
        name: 'RegisterExpert',
        component: () => import('@/views/auth/ExpertRegisterView.vue'),
        meta: { title: '专家注册' }
      },
      {
        path: 'reset-password',
        name: 'ResetPassword',
        component: () => import('@/views/auth/ResetPasswordView.vue'),
        meta: { title: '重置密码' }
      }
    ]
  },
  {
    path: '/test',
    name: 'Test',
    component: TestView,
    meta: {
      title: '测试页面',
      requiresAuth: false
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue'),
    meta: { title: '页面未找到' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 设置路由守卫
setupRouterGuards(router)

export default router 