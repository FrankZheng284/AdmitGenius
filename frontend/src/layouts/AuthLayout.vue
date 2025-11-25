<template>
  <div class="auth-container">
    <div class="auth-content">
      <div class="auth-left">
        <div class="auth-logo">
          <img src="@/assets/logo.png" alt="留学者指南 Logo" class="logo" />
          <h1>留学者指南</h1>
        </div>
        <div class="auth-slogan">
          <h2>让留学申请更简单</h2>
          <p>AI驱动的文书优化与院校推荐平台</p>
        </div>
        <div class="auth-features">
          <div class="feature-item">
            <el-icon class="feature-icon"><Document /></el-icon>
            <div class="feature-text">
              <h3>AI文书优化</h3>
              <p>智能分析与润色，提升文书竞争力</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><School /></el-icon>
            <div class="feature-text">
              <h3>精准院校推荐</h3>
              <p>基于个人背景智能匹配最佳申请院校</p>
            </div>
          </div>
          <div class="feature-item">
            <el-icon class="feature-icon"><ChatDotRound /></el-icon>
            <div class="feature-text">
              <h3>申请社区互动</h3>
              <p>与全球申请者分享经验与见解</p>
            </div>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-form-container">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Document, School, ChatDotRound } from '@element-plus/icons-vue'
</script>

<style scoped lang="scss">
.auth-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.auth-content {
  display: flex;
  width: 1000px;
  max-width: 100%;
  min-height: 600px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.auth-left {
  display: flex;
  flex-direction: column;
  flex: 1;
  background-color: #001529;
  color: white;
  padding: 40px;
}

.auth-logo {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  
  .logo {
    width: 40px;
    height: 40px;
    margin-right: 16px;
  }
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    margin: 0;
  }
}

.auth-slogan {
  margin-bottom: 60px;
  
  h2 {
    font-size: 26px;
    font-weight: 500;
    margin: 0 0 16px 0;
  }
  
  p {
    font-size: 16px;
    opacity: 0.8;
    margin: 0;
  }
}

.auth-features {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32px;
  
  .feature-icon {
    font-size: 24px;
    margin-right: 16px;
    color: #409EFF;
  }
  
  .feature-text {
    h3 {
      font-size: 18px;
      margin: 0 0 8px 0;
    }
    
    p {
      font-size: 14px;
      opacity: 0.7;
      margin: 0;
      line-height: 1.5;
    }
  }
}

.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.auth-form-container {
  width: 100%;
  max-width: 380px;
}

@media (max-width: 768px) {
  .auth-content {
    flex-direction: column;
  }
  
  .auth-left {
    padding: 30px;
  }
  
  .auth-logo {
    margin-bottom: 20px;
  }
  
  .auth-slogan {
    margin-bottom: 30px;
  }
  
  .feature-item {
    margin-bottom: 20px;
  }
}
</style> 