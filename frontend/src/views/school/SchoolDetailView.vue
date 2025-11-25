<template>
  <div class="school-detail-container">
    <el-skeleton :loading="loading" animated v-if="loading">
      <template #template>
        <div class="header-skeleton">
          <el-skeleton-item variant="image" style="width: 120px; height: 120px; margin-right: 24px;" />
          <div style="flex: 1">
            <el-skeleton-item variant="h1" style="width: 50%; margin-bottom: 16px" />
            <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 10px" />
            <el-skeleton-item variant="text" style="width: 60%;" />
          </div>
        </div>
        <el-skeleton-item variant="h3" style="width: 30%; margin: 20px 0" />
        <el-skeleton-item variant="p" style="width: 100%; margin-bottom: 10px" />
        <el-skeleton-item variant="p" style="width: 100%; margin-bottom: 10px" />
        <el-skeleton-item variant="p" style="width: 60%;" />
      </template>
    </el-skeleton>

    <template v-if="!loading && school">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button link @click="goBack">
          <el-icon class="mr-1"><ArrowLeft /></el-icon>
          返回学校列表
        </el-button>
      </div>

      <!-- 学校基本信息 -->
      <el-card class="school-header">
        <div class="school-header-content">
          <div class="school-logo">
            <img 
              :src="school.imageUrl || defaultSchoolIcon" 
              :alt="school.name" 
              @error="onImageError"
              @load="onImageLoad"
            />
          </div>
          <div class="school-header-info">
            <h1 class="school-name">{{ school.name }}</h1>
            <div class="school-location">
              <el-icon><Location /></el-icon>
              <span>{{ formatLocation(school.location) }}</span>
            </div>
            <div class="school-badges">
              <el-tag v-if="school.ranking" type="info" size="small" effect="plain">世界排名 #{{ school.ranking }}</el-tag>
              <el-tag v-if="school.type" type="info" size="small" effect="plain">{{ school.type === 'public' ? '公立' : '私立' }}</el-tag>
              <el-tag v-if="school.acceptanceRate" type="info" size="small" effect="plain">录取率 {{ (school.acceptanceRate * 100).toFixed(1) }}%</el-tag>
            </div>
            <div class="school-actions">
              <el-button 
                type="primary" 
                :loading="savingSchool" 
                @click="toggleSavedSchool"
              >
                <el-icon>
                  <component :is="isSaved ? 'StarFilled' : 'Star'" />
                </el-icon>
                {{ isSaved ? '已保存' : '添加到申请清单' }}
              </el-button>
              <el-button v-if="school.website" type="info" @click="openWebsite">访问官网</el-button>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 学校详细信息 -->
      <div class="school-content">
        <el-row :gutter="24">
          <el-col :span="16">
            <!-- 简介 -->
            <el-card class="content-card">
              <template #header>
                <div class="card-header">
                  <span>学校简介</span>
                </div>
              </template>
              <div class="school-description">
                <p>{{ school.description || '暂无简介信息' }}</p>
              </div>
            </el-card>

            <!-- 专业设置 -->
            <el-card class="content-card">
              <template #header>
                <div class="card-header">
                  <span>开设专业</span>
                </div>
              </template>
              <div class="school-programs">
                <template v-if="school.programs && school.programs.length">
                  <el-tag
                    v-for="program in school.programs"
                    :key="program.id"
                    class="program-tag"
                    effect="plain"
                  >
                    {{ program.name }}
                  </el-tag>
                </template>
                <el-empty v-else description="暂无专业信息" />
              </div>
            </el-card>

            <!-- 申请要求 -->
            <el-card class="content-card">
              <template #header>
                <div class="card-header">
                  <span>申请要求</span>
                </div>
              </template>
              <div class="requirements">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="GPA要求">
                    <el-tag type="warning">3.7+</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="托福要求">
                    <el-tag type="warning">100+</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="GRE要求">
                    <el-tag type="warning">320+</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="申请截止日期">
                    <el-tag type="warning">12月15日</el-tag>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <!-- 基本信息 -->
            <el-card class="side-card">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                </div>
              </template>
              <ul class="info-list">
                <li>
                  <span class="info-label">建校时间:</span>
                  <span class="info-value">1891年</span>
                </li>
                <li>
                  <span class="info-label">学生人数:</span>
                  <span class="info-value">30,000+</span>
                </li>
                <li>
                  <span class="info-label">师生比例:</span>
                  <span class="info-value">1:15</span>
                </li>
                <li>
                  <span class="info-label">国际生比例:</span>
                  <span class="info-value">25%</span>
                </li>
              </ul>
            </el-card>

            <!-- 录取数据 -->
            <el-card class="side-card">
              <template #header>
                <div class="card-header">
                  <span>录取数据</span>
                </div>
              </template>
              <div class="admission-stats">
                <div class="stat-item">
                  <div class="stat-value">{{ school.acceptanceRate ? (school.acceptanceRate * 100).toFixed(1) : '--' }}%</div>
                  <div class="stat-label">录取率</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">3.8</div>
                  <div class="stat-label">平均GPA</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">1450</div>
                  <div class="stat-label">平均SAT分数</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 专业列表 -->
      <el-card v-if="programs && programs.length > 0" class="programs-section">
        <template #header>
          <div class="card-header">
            <span>专业列表</span>
          </div>
        </template>
        
        <el-table
          v-loading="loadingPrograms"
          :data="programs"
          style="width: 100%">
          <el-table-column prop="name" label="专业名称" />
          <el-table-column prop="degreeLevel" label="学位类型" />
          <el-table-column prop="department" label="院系" />
          <el-table-column prop="duration" label="学制(年)" />
          <el-table-column prop="tuitionFee" label="学费">
            <template #default="{ row }">
              {{ row.tuitionFee || '未提供' }}
            </template>
          </el-table-column>
          <el-table-column label="奖学金">
            <template #default="{ row }">
              <el-tag :type="row.scholarshipAvailable ? 'success' : 'info'">
                {{ row.scholarshipAvailable ? '有' : '无' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      
      <el-empty v-else-if="!loadingPrograms" description="暂无专业信息" />
    </template>

    <el-empty v-if="!loading && !school" description="未找到学校信息">
      <template #extra>
        <el-button type="primary" @click="goBack">返回学校列表</el-button>
      </template>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft, Location, Star, StarFilled } from '@element-plus/icons-vue';
import RecommendationService from '@/api/services/recommendation';
import { UserService } from '@/api/services/user';
import { useAuthStore } from '@/stores/auth';
import api from '@/api';
import type { School, SchoolProgram } from '@/types';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const loading = ref(true);
const school = ref<School | null>(null);
const programs = ref<SchoolProgram[]>([]);
const loadingPrograms = ref(false);
const savingSchool = ref(false);
const isSaved = ref(false);

// 默认学校图标（SVG）
const defaultSchoolIcon = 'data:image/svg+xml;base64,' + btoa(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="#409EFF">
  <rect width="120" height="120" fill="#f5f7fa" rx="8"/>
  <path d="M60 20L30 35v50l30 15 30-15V35L60 20zm0 8l20 10v35l-20 10-20-10V38l20-10z" fill="#409EFF"/>
  <circle cx="60" cy="60" r="8" fill="#409EFF"/>
</svg>
`);

const fetchSchoolPrograms = async (schoolId: number) => {
  try {
    loadingPrograms.value = true;
    const response = await api.get<SchoolProgram[]>(`/api/recommendations/schools/${schoolId}/programs`);
    
    // API直接返回数组，不是{data: [...]}格式
    const programsData = Array.isArray(response) ? response : response.data || response;
    
    programs.value = programsData;
    console.log('处理后的专业数据:', programsData);
    
    // 确保school.value存在并赋值programs
    if (school.value) {
      school.value.programs = programsData;
      console.log('赋值后的school.value.programs:', school.value.programs);
    } else {
      console.error('school.value为null，无法赋值programs');
    }
  } catch (error) {
    console.error('Failed to fetch school programs:', error);
    ElMessage.error('加载专业信息失败，请稍后重试');
    programs.value = [];
  } finally {
    loadingPrograms.value = false;
  }
};

const fetchSchoolDetail = async () => {
  const schoolIdParam = route.params.id;
  const schoolId = Array.isArray(schoolIdParam) ? parseInt(schoolIdParam[0], 10) : parseInt(schoolIdParam as string, 10);

  if (isNaN(schoolId)) {
    loading.value = false;
    ElMessage.error('无效的学校ID');
    router.push('/schools');
    return;
  }

  try {
    loading.value = true;
    const schoolData = await RecommendationService.getSchoolById(schoolId);
    
    // 确保schoolData有programs属性
    if (schoolData && !schoolData.programs) {
      schoolData.programs = [];
    }
    
    school.value = schoolData;
    console.log('获取到的学校数据:', schoolData);
    console.log('学校图片URL:', schoolData?.imageUrl);
    
    if (!schoolData) {
      ElMessage.error('未找到学校信息');
      school.value = null;
    } else {
      // 获取学校项目信息
      await fetchSchoolPrograms(schoolId);
      
      // 检查学校是否已保存
      await checkSavedStatus(schoolId);
    }
  } catch (error) {
    console.error('Failed to fetch school details:', error);
    ElMessage.error('加载学校详情失败，请稍后重试');
    school.value = null;
  } finally {
    loading.value = false;
  }
};

const openWebsite = () => {
  if (school.value?.website) {
    const url = school.value.website.startsWith('http') ? school.value.website : `https://${school.value.website}`;
    window.open(url, '_blank');
  } else {
    ElMessage.info('该学校未提供官网链接');
  }
};

const goBack = () => {
  router.push('/schools');
};

const goToSchoolDetail = (id: number) => {
  router.push(`/schools/${id}`);
};

const onImageError = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.error('图片加载错误:', {
    src: img.src,
    schoolId: route.params.id,
    schoolImageUrl: school.value?.imageUrl,
    schoolName: school.value?.name
  });
  ElMessage.warning(`学校图标加载失败: ${school.value?.name || '未知学校'}`);
};

const onImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement;
  console.log('图片加载成功:', {
    src: img.src,
    schoolId: route.params.id,
    schoolImageUrl: school.value?.imageUrl,
    schoolName: school.value?.name
  });
};

const formatLocation = (location?: string) => {
  if (!location) {
    return '位置信息暂无';
  }
  // 尝试拆分location字段，例如 "Boston, Massachusetts, USA" -> "Boston, USA"
  const parts = location.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    // 如果有多个部分，显示第一部分（城市）和最后一部分（国家）
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  }
  return location;
};

const checkSavedStatus = async (schoolId: number) => {
  if (!authStore.user?.id) {
    isSaved.value = false;
    return;
  }
  
  try {
    const savedSchoolIds = await UserService.getSavedSchools(authStore.user.id);
    isSaved.value = Array.isArray(savedSchoolIds) ? savedSchoolIds.includes(schoolId) : false;
  } catch (error) {
    console.error('Failed to check saved status:', error);
    isSaved.value = false;
  }
};

const toggleSavedSchool = async () => {
  if (!authStore.user?.id) {
    ElMessage.warning('请先登录');
    return;
  }
  
  if (savingSchool.value || !school.value) return;

  try {
    savingSchool.value = true;
    const schoolId = Array.isArray(route.params.id) ? parseInt(route.params.id[0], 10) : parseInt(route.params.id as string, 10);
    
    await UserService.toggleSavedSchool(authStore.user.id, schoolId, !isSaved.value);
    
    if (!isSaved.value) {
      ElMessage.success('学校已保存到申请清单');
      isSaved.value = true;
    } else {
      ElMessage.success('已从申请清单中移除');
      isSaved.value = false;
    }
  } catch (error) {
    console.error('Failed to toggle saved school:', error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    savingSchool.value = false;
  }
};

onMounted(() => {
  fetchSchoolDetail();
});
</script>

<style scoped lang="scss">
.school-detail-container {
  padding-bottom: 40px;
}

.back-button {
  margin-bottom: 16px;
}

.header-skeleton {
  display: flex;
  margin-bottom: 24px;
}

.school-header {
  margin-bottom: 24px;
  background-color: #f8f9fa;
  
  .school-header-content {
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
    }
  }
  
  .school-logo {
    margin-right: 24px;
    
    img {
      width: 120px;
      height: 120px;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      background-color: white;
      padding: 8px;
    }
    
    @media (max-width: 768px) {
      margin-bottom: 16px;
      margin-right: 0;
      align-self: center;
    }
  }
  
  .school-header-info {
    flex: 1;
  }
  
  .school-name {
    font-size: 28px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #303133;
  }
  
  .school-location {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    color: #606266;
    margin-bottom: 16px;
  }
  
  .school-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  
  .school-actions {
    display: flex;
    gap: 16px;
    
    @media (max-width: 576px) {
      flex-direction: column;
      gap: 8px;
    }
  }
}

.school-content {
  .content-card, .side-card {
    margin-bottom: 24px;
  }
  
  .card-header {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
  
  .school-description {
    font-size: 15px;
    line-height: 1.6;
    color: #606266;
    
    p {
      margin: 0 0 16px 0;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .school-programs {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .program-tag {
      margin-bottom: 8px;
    }
  }
  
  .info-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #ececec;
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    .info-label {
      color: #909399;
    }
    
    .info-value {
      color: #303133;
      font-weight: 500;
    }
  }
  
  .admission-stats {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    
    .stat-item {
      flex: 1;
      min-width: 80px;
      text-align: center;
      
      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #409EFF;
        margin-bottom: 4px;
      }
      
      .stat-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}

:deep(.el-descriptions__cell) {
  padding: 12px 16px;
}

@media (max-width: 992px) {
  .requirements {
    :deep(.el-descriptions) {
      width: 100%;
    }
  }
}

.programs-section {
  margin-top: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 