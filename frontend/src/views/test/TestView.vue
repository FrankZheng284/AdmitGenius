<template>
  <div class="test-container">
    <h1>测试页面</h1>
    <p>这是一个简单的测试页面，用于检查基本路由和布局功能是否正常工作。</p>
    
    <div class="test-section">
      <h2>基本组件测试</h2>
      <el-button type="primary" @click="showMessage">点击测试按钮</el-button>
      <el-divider />
      
      <h2>环境信息</h2>
      <p>路由路径: {{ route.path }}</p>
      <p>页面标题: {{ route.meta.title || '无标题' }}</p>
      <p>当前时间: {{ currentTime }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const currentTime = ref(new Date().toLocaleString())

// 每秒更新时间
setInterval(() => {
  currentTime.value = new Date().toLocaleString()
}, 1000)

const showMessage = () => {
  ElMessage.success('按钮点击成功！Element Plus组件工作正常。')
}

onMounted(() => {
  console.log('测试页面已加载')
})
</script>

<style scoped>
.test-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.test-section {
  margin-top: 20px;
}

h1 {
  color: #409EFF;
  margin-bottom: 20px;
}

h2 {
  color: #606266;
  margin: 16px 0;
}
</style> 