import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import { config } from './config'

import './assets/styles/main.scss'

// 初始化全局配置，使其可以在模拟API拦截器中访问
(window as any).config = config

// 在开发模式下输出配置信息
if (import.meta.env.DEV && config.enableDevLogs) {
  console.log('应用配置:', config)
  console.log(`模拟API模式: ${config.api.useMockData ? '启用' : '禁用'}`)
}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, {
  locale: zhCn
})

// 全局注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app') 