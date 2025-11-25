我希望这个profile能实现这些功能：<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>个人资料</h2>
          <el-button type="primary" @click="isEditing = !isEditing">
            {{ isEditing ? '保存' : '编辑' }}
          </el-button>
        </div>
      </template>
      
      <el-form 
        ref="profileFormRef" 
        :model="profileForm" 
        :rules="profileRules" 
        :disabled="!isEditing"
        label-position="top"
      >
        <div class="avatar-section">
          <el-avatar :size="100" :src="avatarUrl" />
          <el-upload
            v-if="isEditing"
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleAvatarChange"
          >
            <el-button size="small" type="primary">更换头像</el-button>
          </el-upload>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="profileForm.name" placeholder="您的姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" placeholder="用户名" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" placeholder="您的邮箱" disabled />
        </el-form-item>
        
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="profileForm.phone" placeholder="您的手机号码" />
        </el-form-item>
        
        <el-form-item label="个人简介" prop="bio">
          <el-input 
            v-model="profileForm.bio" 
            type="textarea" 
            :rows="4" 
            placeholder="介绍一下自己..." 
          />
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card class="security-card">
      <template #header>
        <div class="card-header">
          <h2>账号安全</h2>
        </div>
      </template>
      
      <div class="security-item">
        <div class="security-info">
          <h3>修改密码</h3>
          <p>定期更换密码可以保护您的账号安全</p>
        </div>
        <el-button @click="showChangePasswordDialog = true">修改</el-button>
      </div>
      
      <!-- <div class="security-item">
        <div class="security-info">
          <h3>两步验证</h3>
          <p>启用两步验证以增强账号安全性</p>
        </div>
        <el-switch v-model="twoFactorEnabled" />
      </div> -->
    </el-card>

    <el-card class="info-collect-card">
      <template #header>
        <div class="card-header">
          <h2>个人信息收集</h2>
        </div>
      </template>
      <el-tabs v-model="infoTab">
        <el-tab-pane label="教育经历" name="education">
          <el-button type="primary" @click="openEducationDialog()" style="margin-bottom: 12px;">新增教育经历</el-button>
          <el-timeline>
            <el-timeline-item
              v-for="(edu, idx) in educationList"
              :key="edu.id"
              :timestamp="edu.start + ' ~ ' + edu.end"
              placement="top"
            >
              <div class="edu-item">
                <div><b>{{ edu.school }}</b>（{{ edu.degree }}，{{ edu.major }}）</div>
                <div>主要成就：{{ edu.achievement }}</div>
                <el-button size="small" @click="openEducationDialog(edu, idx)">编辑</el-button>
                <el-button size="small" type="danger" @click="removeEducation(idx)">删除</el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
        <el-tab-pane label="项目经历" name="project">
          <el-button type="primary" @click="openProjectDialog()" style="margin-bottom: 12px;">新增项目经历</el-button>
          <el-timeline>
            <el-timeline-item
              v-for="(proj, idx) in projectList"
              :key="proj.id"
              :timestamp="proj.time"
              placement="top"
            >
              <div class="proj-item">
                <div><b>{{ proj.name }}</b>（{{ proj.isLeader ? '负责人' : '成员' }}）</div>
                <div>主要内容：{{ proj.content }}</div>
                <el-button size="small" @click="openProjectDialog(proj, idx)">编辑</el-button>
                <el-button size="small" type="danger" @click="removeProject(idx)">删除</el-button>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 教育经历弹窗 -->
    <el-dialog v-model="showEducationDialog" :title="editEduIdx === null ? '新增教育经历' : '编辑教育经历'" width="500px">
      <el-form :model="educationForm" :rules="educationRules" ref="educationFormRef" label-position="top">
        <el-form-item label="学校名称" prop="school">
          <el-input v-model="educationForm.school" placeholder="请输入学校名称" />
        </el-form-item>
        <el-form-item label="学位" prop="degree">
          <el-select v-model="educationForm.degree" placeholder="请选择学位">
            <el-option label="本科" value="本科" />
            <el-option label="硕士" value="硕士" />
            <el-option label="博士" value="博士" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="专业" prop="major">
          <el-input v-model="educationForm.major" placeholder="请输入专业" />
        </el-form-item>
        <el-form-item label="起止时间" required>
          <el-date-picker
            v-model="educationForm.dates"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="主要成就" prop="achievement">
          <el-input 
            v-model="educationForm.achievement" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入主要成就" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEducationDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEducation">保存</el-button>
      </template>
    </el-dialog>

    <!-- 项目经历弹窗 -->
    <el-dialog v-model="showProjectDialog" :title="editProjIdx === null ? '新增项目经历' : '编辑项目经历'" width="500px">
      <el-form :model="projectForm" :rules="projectRules" ref="projectFormRef" label-position="top">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目时间" required>
          <el-date-picker
            v-model="projectForm.dates"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="主要内容" prop="content">
          <el-input 
            v-model="projectForm.content" 
            type="textarea" 
            :rows="2" 
            placeholder="请输入主要内容" 
          />
        </el-form-item>
        <el-form-item label="是否负责人" prop="isLeader">
          <el-switch v-model="projectForm.isLeader" active-text="是" inactive-text="否" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showProjectDialog = false">取消</el-button>
        <el-button type="primary" @click="saveProject">保存</el-button>
      </template>
    </el-dialog>
  </div>
  
  <!-- 修改密码对话框 -->
  <el-dialog v-model="showChangePasswordDialog" title="修改密码" width="500px">
    <el-form 
      ref="passwordFormRef" 
      :model="passwordForm" 
      :rules="passwordRules" 
      label-position="top"
    >
      <el-form-item label="当前密码" prop="currentPassword">
        <el-input 
          v-model="passwordForm.currentPassword" 
          type="password" 
          show-password 
          placeholder="请输入当前密码" 
        />
      </el-form-item>
      
      <el-form-item label="新密码" prop="newPassword">
        <el-input 
          v-model="passwordForm.newPassword" 
          type="password" 
          show-password 
          placeholder="请输入新密码" 
        />
      </el-form-item>
      
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input 
          v-model="passwordForm.confirmPassword" 
          type="password" 
          show-password 
          placeholder="请再次输入新密码" 
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showChangePasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
          确认修改
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useMockAuthStore } from '@/stores/mockAuth'
import { UserService } from '@/api/services/user'
import { ProfileService, type Education, type Project } from '@/api/services/profile'
import { config } from '@/config'
import { nanoid } from 'nanoid'

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 获取合适的认证存储
const authStore = useAuthStore()
const mockAuthStore = useMockAuthStore()
const store = computed(() => {
  return config.api.useMockData ? mockAuthStore : authStore
})

// 计算属性 - 正确的头像URL
const avatarUrl = computed(() => {
  if (!profileForm.avatar) {
    return defaultAvatar
  }
  
  // 如果已经是完整URL，直接返回
  if (profileForm.avatar.startsWith('http')) {
    return profileForm.avatar
  }
  
  // 如果是相对路径，需要拼接后端基础URL
  if (profileForm.avatar.startsWith('/api/')) {
    // 从config中获取baseUrl的主机部分
    const apiUrl = config.api.baseUrl.replace('/api', '') // 移除末尾的/api
    return `${apiUrl}${profileForm.avatar}`
  }
  
  // 兼容旧的路径格式
  if (profileForm.avatar.startsWith('/')) {
    return `${config.api.baseUrl}${profileForm.avatar}`
  }
  
  return profileForm.avatar
})

// 状态
const isEditing = ref(false)
const profileFormRef = ref<FormInstance>()
const passwordFormRef = ref<FormInstance>()
const loading = ref(false)
const passwordLoading = ref(false)
const showChangePasswordDialog = ref(false)
const twoFactorEnabled = ref(false)

// 个人信息收集相关
const infoTab = ref('education')
const educationLoading = ref(false)
const projectLoading = ref(false)

// 表单数据
const profileForm = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  avatar: ''
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证规则
const profileRules = reactive<FormRules>({
  name: [
    { required: true, message: '请输入您的姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应为2-20个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应为3-20个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 密码验证规则
const passwordRules = reactive<FormRules>({
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
})

// 教育经历
interface EducationItem {
  id?: number;
  school: string;
  degree: string;
  major: string;
  start: string;
  end: string;
  achievement: string;
}
const educationList = ref<EducationItem[]>([])
const showEducationDialog = ref(false)
const editEduIdx = ref<number|null>(null)
const editingEducationId = ref<number|null>(null)
const educationFormRef = ref<FormInstance>()
const educationForm = reactive<{
  school: string;
  degree: string;
  major: string;
  dates: string[];
  achievement: string;
}>({
  school: '',
  degree: '',
  major: '',
  dates: [],
  achievement: ''
})
const educationRules = reactive<FormRules>({
  school: [{ required: true, message: '请输入学校名称', trigger: 'blur' }],
  degree: [{ required: true, message: '请选择学位', trigger: 'change' }],
  major: [{ required: true, message: '请输入专业', trigger: 'blur' }],
  achievement: [{ required: true, message: '请输入主要成就', trigger: 'blur' }]
})

// 项目经历
interface ProjectItem {
  id?: number;
  name: string;
  time: string;
  content: string;
  isLeader: boolean;
}
const projectList = ref<ProjectItem[]>([])
const showProjectDialog = ref(false)
const editProjIdx = ref<number|null>(null)
const editingProjectId = ref<number|null>(null)
const projectFormRef = ref<FormInstance>()
const projectForm = reactive<{
  name: string;
  dates: string[];
  content: string;
  isLeader: boolean;
}>({
  name: '',
  dates: [],
  content: '',
  isLeader: false
})
const projectRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入主要内容', trigger: 'blur' }]
})

// ========== 教育经历相关方法 ==========

/**
 * 获取教育经历列表
 */
const fetchEducations = async () => {
  if (config.api.useMockData) {
    // 模拟数据模式，保持原有的空数组
    return
  }

  educationLoading.value = true
  try {
    const response = await ProfileService.getEducations()
    if (response.success && response.data) {
      educationList.value = response.data.map((edu: Education) => ({
        id: edu.id,
        school: edu.school,
        degree: edu.degree,
        major: edu.major,
        start: edu.startDate,
        end: edu.endDate,
        achievement: edu.achievement || ''
      }))
    } else {
      ElMessage.error(response.message || '获取教育经历失败')
    }
  } catch (error) {
    console.error('获取教育经历失败:', error)
    ElMessage.error('获取教育经历失败，请稍后重试')
  } finally {
    educationLoading.value = false
  }
}

function openEducationDialog(edu: EducationItem | null = null, idx: number|null = null) {
  if (edu) {
    Object.assign(educationForm, {
      school: edu.school,
      degree: edu.degree,
      major: edu.major,
      dates: [edu.start, edu.end],
      achievement: edu.achievement
    })
    editEduIdx.value = idx
    editingEducationId.value = edu.id || null
  } else {
    Object.assign(educationForm, { school: '', degree: '', major: '', dates: [], achievement: '' })
    editEduIdx.value = null
    editingEducationId.value = null
  }
  showEducationDialog.value = true
}

const saveEducation = async () => {
  const valid = await educationFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const [start, end] = educationForm.dates
  const educationData = {
    school: educationForm.school,
    degree: educationForm.degree,
    major: educationForm.major,
    startDate: start || '',
    endDate: end || '',
    achievement: educationForm.achievement
  }

  if (config.api.useMockData) {
    // 模拟数据模式，保持原有逻辑
    const eduData: EducationItem = {
      id: editingEducationId.value || Date.now(),
      school: educationForm.school,
      degree: educationForm.degree,
      major: educationForm.major,
      start: start || '',
      end: end || '',
      achievement: educationForm.achievement
    }
    if (editEduIdx.value !== null) {
      educationList.value.splice(editEduIdx.value, 1, eduData)
    } else {
      educationList.value.push(eduData)
    }
    showEducationDialog.value = false
    ElMessage.success(editEduIdx.value !== null ? '更新教育经历成功' : '创建教育经历成功')
    return
  }

  try {
    let response
    if (editingEducationId.value) {
      // 更新
      response = await ProfileService.updateEducation(editingEducationId.value, educationData)
    } else {
      // 创建
      response = await ProfileService.createEducation(educationData)
    }

    if (response.success) {
      ElMessage.success(response.message || (editingEducationId.value ? '更新教育经历成功' : '创建教育经历成功'))
      showEducationDialog.value = false
      await fetchEducations() // 重新获取列表
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('保存教育经历失败:', error)
    ElMessage.error('保存教育经历失败，请稍后重试')
  }
}

const removeEducation = async (idx: number) => {
  const education = educationList.value[idx]
  
  if (config.api.useMockData) {
    // 模拟数据模式，保持原有逻辑
    educationList.value.splice(idx, 1)
    ElMessage.success('删除教育经历成功')
    return
  }

  if (!education.id) {
    ElMessage.error('教育经历ID无效')
    return
  }

  try {
    const response = await ProfileService.deleteEducation(education.id)
    if (response.success) {
      ElMessage.success(response.message || '删除教育经历成功')
      await fetchEducations() // 重新获取列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除教育经历失败:', error)
    ElMessage.error('删除教育经历失败，请稍后重试')
  }
}

// ========== 项目经历相关方法 ==========

/**
 * 获取项目经历列表
 */
const fetchProjects = async () => {
  if (config.api.useMockData) {
    // 模拟数据模式，保持原有的空数组
    return
  }

  projectLoading.value = true
  try {
    const response = await ProfileService.getProjects()
    if (response.success && response.data) {
      projectList.value = response.data.map((proj: Project) => ({
        id: proj.id,
        name: proj.name,
        time: `${proj.startDate} ~ ${proj.endDate}`,
        content: proj.content || '',
        isLeader: proj.isLeader
      }))
    } else {
      ElMessage.error(response.message || '获取项目经历失败')
    }
  } catch (error) {
    console.error('获取项目经历失败:', error)
    ElMessage.error('获取项目经历失败，请稍后重试')
  } finally {
    projectLoading.value = false
  }
}

function openProjectDialog(proj: ProjectItem | null = null, idx: number|null = null) {
  if (proj) {
    const dates = proj.time ? proj.time.split(' ~ ') : []
    Object.assign(projectForm, {
      name: proj.name,
      dates: dates,
      content: proj.content,
      isLeader: proj.isLeader
    })
    editProjIdx.value = idx
    editingProjectId.value = proj.id || null
  } else {
    Object.assign(projectForm, { name: '', dates: [], content: '', isLeader: false })
    editProjIdx.value = null
    editingProjectId.value = null
  }
  showProjectDialog.value = true
}

const saveProject = async () => {
  const valid = await projectFormRef.value?.validate().catch(() => false)
  if (!valid) return

  const [start, end] = projectForm.dates
  const projectData = {
    name: projectForm.name,
    startDate: start || '',
    endDate: end || '',
    content: projectForm.content,
    isLeader: projectForm.isLeader
  }

  if (config.api.useMockData) {
    // 模拟数据模式，保持原有逻辑
    const projData: ProjectItem = {
      id: editingProjectId.value || Date.now(),
      name: projectForm.name,
      time: (start || '') + ' ~ ' + (end || ''),
      content: projectForm.content,
      isLeader: projectForm.isLeader
    }
    if (editProjIdx.value !== null) {
      projectList.value.splice(editProjIdx.value, 1, projData)
    } else {
      projectList.value.push(projData)
    }
    showProjectDialog.value = false
    ElMessage.success(editProjIdx.value !== null ? '更新项目经历成功' : '创建项目经历成功')
    return
  }

  try {
    let response
    if (editingProjectId.value) {
      // 更新
      response = await ProfileService.updateProject(editingProjectId.value, projectData)
    } else {
      // 创建
      response = await ProfileService.createProject(projectData)
    }

    if (response.success) {
      ElMessage.success(response.message || (editingProjectId.value ? '更新项目经历成功' : '创建项目经历成功'))
      showProjectDialog.value = false
      await fetchProjects() // 重新获取列表
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('保存项目经历失败:', error)
    ElMessage.error('保存项目经历失败，请稍后重试')
  }
}

const removeProject = async (idx: number) => {
  const project = projectList.value[idx]
  
  if (config.api.useMockData) {
    // 模拟数据模式，保持原有逻辑
    projectList.value.splice(idx, 1)
    ElMessage.success('删除项目经历成功')
    return
  }

  if (!project.id) {
    ElMessage.error('项目经历ID无效')
    return
  }

  try {
    const response = await ProfileService.deleteProject(project.id)
    if (response.success) {
      ElMessage.success(response.message || '删除项目经历成功')
      await fetchProjects() // 重新获取列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    console.error('删除项目经历失败:', error)
    ElMessage.error('删除项目经历失败，请稍后重试')
  }
}

// 获取用户信息
const fetchUserProfile = async () => {
  if (config.api.useMockData) {
    // 模拟数据模式
    const currentUser = store.value.user
    if (currentUser) {
      const userData = {
        name: currentUser.fullName || '用户',
        username: currentUser.email?.split('@')[0] || 'user',
        email: currentUser.email || '',
        phone: '',
        bio: '我是一名申请留学的学生，希望能获得更多的申请指导和帮助。',
        avatar: currentUser.profilePicture || ''
      }
      Object.assign(profileForm, userData)
    }
    return
  }

  // 真实API模式
  loading.value = true
  try {
    const response = await UserService.getCurrentUserProfile()
    if (response.success && response.data) {
      const user = response.data
      const userData = {
        name: user.fullName || '用户',
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '我是一名申请留学的学生，希望能获得更多的申请指导和帮助。',
        avatar: user.profilePicture || ''
      }
      Object.assign(profileForm, userData)
    } else {
      ElMessage.error(response.message || '获取用户资料失败')
    }
  } catch (error) {
    console.error('获取用户资料失败:', error)
    ElMessage.error('获取用户资料失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 保存用户资料
const saveUserProfile = async () => {
  if (!profileFormRef.value) return
  
  const valid = await profileFormRef.value.validate().catch(() => false)
  if (!valid) {
    isEditing.value = true
    return
  }

  if (config.api.useMockData) {
    // 模拟数据模式
    loading.value = true
    setTimeout(() => {
      ElMessage.success('个人资料已更新')
      isEditing.value = false
      loading.value = false
    }, 1000)
    return
  }

  // 真实API模式
  loading.value = true
  try {
    const updateData = {
      fullName: profileForm.name,
      phone: profileForm.phone,
      bio: profileForm.bio,
      profilePicture: profileForm.avatar
    }
    
    const response = await UserService.updateCurrentUserProfile(updateData)
    if (response.success) {
      ElMessage.success('个人资料已更新')
      isEditing.value = false
      
      // 更新store中的用户信息
      if (response.data) {
        store.value.updateUser(response.data)
      }
    } else {
      ElMessage.error(response.message || '更新失败')
      isEditing.value = true
    }
  } catch (error) {
    console.error('保存用户资料失败:', error)
    ElMessage.error('保存用户资料失败，请稍后重试')
    isEditing.value = true
  } finally {
    loading.value = false
  }
}

// 处理头像变更
const handleAvatarChange = async (uploadFile: UploadFile) => {
  const rawFile = uploadFile.raw
  if (!rawFile) return
  
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('头像必须是JPG或PNG格式的图片!')
    return
  }
  
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('头像图片大小不能超过2MB!')
    return
  }

  if (config.api.useMockData) {
    // 模拟数据模式，创建预览URL
    profileForm.avatar = URL.createObjectURL(rawFile)
    ElMessage.success('头像预览已更新，点击保存生效')
    return
  }

  // 真实API模式，立即上传
  try {
    const response = await UserService.uploadAvatar(rawFile)
    if (response.success && response.data) {
      profileForm.avatar = response.data
      ElMessage.success('头像上传成功')
      
      // 直接更新store中的用户信息，避免调用saveUserProfile造成循环
      if (store.value.user) {
        const updatedUser = { ...store.value.user, profilePicture: response.data }
        store.value.updateUser(updatedUser)
      }
    } else {
      ElMessage.error(response.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请稍后重试')
  }
}

// 处理密码修改
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return

  if (config.api.useMockData) {
    // 模拟数据模式
    passwordLoading.value = true
    setTimeout(() => {
      ElMessage.success('密码已成功修改')
      showChangePasswordDialog.value = false
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordLoading.value = false
    }, 1000)
    return
  }

  // 真实API模式
  passwordLoading.value = true
  try {
    const response = await UserService.changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    if (response.success) {
      ElMessage.success('密码已成功修改')
      showChangePasswordDialog.value = false
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    } else {
      ElMessage.error(response.message || '修改密码失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败，请确认当前密码是否正确')
  } finally {
    passwordLoading.value = false
  }
}

// 监听编辑状态改变
const watchEditingChange = () => {
  if (!isEditing.value) {
    saveUserProfile()
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchUserProfile()
  await fetchEducations()
  await fetchProjects()
})

// 监听编辑状态
import { watch } from 'vue'
watch(isEditing, watchEditingChange)
</script>

<style scoped lang="scss">
.profile-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.profile-card, .security-card {
  margin-bottom: 20px;
  border-radius: 8px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
  
  .el-avatar {
    margin-bottom: 12px;
  }
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
  
  &:last-child {
    border-bottom: none;
  }
  
  .security-info {
    h3 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    p {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
}

.info-collect-card {
  margin-bottom: 20px;
  border-radius: 8px;
}
.edu-item, .proj-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}
</style> 