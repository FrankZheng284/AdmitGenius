<template>
  <div class="recommendation-container">
    <h1 class="page-title">院校推荐</h1>
    
    <el-tabs v-model="activeTab" class="recommendation-tabs">
      <el-tab-pane label="匹配院校" name="matched">
        <div class="tab-header">
          <p class="tab-description">
            根据您的背景和偏好，系统为您匹配了以下院校。
            您可以查看详情并保存感兴趣的院校。
          </p>
          <el-button type="primary" @click="showPreferenceDialog = true">
            更新偏好
          </el-button>
        </div>
        
        <!-- 匹配院校列表 -->
        <div class="schools-container" v-loading="loading">
          <template v-if="matchedSchools.length">
            <el-card v-for="school in matchedSchools" :key="school.id" class="school-card">
              <div class="school-header">
                <div class="school-logo">
                  <img :src="school.imageUrl || defaultSchoolLogo" :alt="school.name">
                </div>
                <div class="school-title">
                  <h3>{{ school.name }}</h3>
                  <p class="school-location">{{ school.location }}</p>
                </div>
                <div class="school-actions">
                  <el-button 
                    type="primary" 
                    circle 
                    @click="toggleSavedSchool(school.id)"
                  >
                    <el-icon>
                      <component :is="isSaved(school.id) ? 'StarFilled' : 'Star'" />
                    </el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="school-stats">
                <div class="stat-item">
                  <span class="stat-label">排名</span>
                  <span class="stat-value">{{ school.ranking || '暂无' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">录取率</span>
                  <span class="stat-value">{{ formatPercentage(school.acceptanceRate) }}</span>
                </div>
              </div>
              
              <div class="school-programs" v-if="school.programs && school.programs.length">
                <h4>热门专业</h4>
                <el-tag v-for="program in school.programs.slice(0, 3)" :key="program.id || program.name" size="small">
                  {{ program.name }}
                </el-tag>
                <el-tag v-if="school.programs.length > 3" size="small">
                  +{{ school.programs.length - 3 }}
                </el-tag>
              </div>
              
              <div class="school-description">
                <p>{{ limitText(school.description || '暂无描述', 150) }}</p>
              </div>
              
              <div class="school-footer">
                <el-button type="primary" text @click="viewSchoolDetail(school.id)">
                  查看详情
                </el-button>
                <el-button type="primary" text @click="openSchoolWebsite(school.website)">
                  访问官网
                </el-button>
              </div>
            </el-card>
          </template>
          
          <el-empty v-else-if="!loading" description="暂无匹配院校，请更新您的偏好">
            <el-button type="primary" @click="showPreferenceDialog = true">
              设置偏好
            </el-button>
          </el-empty>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="已保存院校" name="saved">
        <div class="tab-header">
          <p class="tab-description">
            您已保存的感兴趣院校列表。
          </p>
        </div>
        
        <!-- 已保存院校列表 -->
        <div class="schools-container" v-loading="loadingSaved">
          <template v-if="savedSchools.length">
            <el-card v-for="school in savedSchools" :key="school.id" class="school-card">
              <div class="school-header">
                <div class="school-logo">
                  <img :src="school.imageUrl || defaultSchoolLogo" :alt="school.name">
                </div>
                <div class="school-title">
                  <h3>{{ school.name }}</h3>
                  <p class="school-location">{{ school.location }}</p>
                </div>
                <div class="school-actions">
                  <el-button 
                    type="danger" 
                    circle 
                    @click="toggleSavedSchool(school.id)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="school-stats">
                <div class="stat-item">
                  <span class="stat-label">排名</span>
                  <span class="stat-value">{{ school.ranking || '暂无' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">录取率</span>
                  <span class="stat-value">{{ formatPercentage(school.acceptanceRate) }}</span>
                </div>
              </div>
              
              <div class="school-footer">
                <el-button type="primary" text @click="viewSchoolDetail(school.id)">
                  查看详情
                </el-button>
                <el-button type="primary" text @click="openSchoolWebsite(school.website)">
                  访问官网
                </el-button>
              </div>
            </el-card>
          </template>
          
          <el-empty v-else-if="!loadingSaved" description="您还没有保存任何院校">
            <el-button type="primary" @click="activeTab = 'matched'">
              浏览推荐院校
            </el-button>
          </el-empty>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="浏览所有院校" name="all">
        <div class="tab-header">
          <p class="tab-description">
            浏览所有可申请院校。
          </p>
          <div class="filter-options">
            <el-input
              v-model="searchQuery"
              placeholder="搜索院校名称"
              prefix-icon="Search"
              clearable
              @clear="searchSchools"
              @input="debounceSearch"
            />
            <el-select v-model="countryFilter" placeholder="国家/地区" clearable @change="filterSchools">
              <el-option
                v-for="country in availableCountries"
                :key="country"
                :label="country"
                :value="country"
              />
            </el-select>
            <el-select v-model="programFilter" placeholder="专业方向" clearable @change="filterSchools">
              <el-option
                v-for="program in availablePrograms"
                :key="program"
                :label="program"
                :value="program"
              />
            </el-select>
          </div>
        </div>
        
        <!-- 所有院校列表 -->
        <div class="schools-container" v-loading="loadingAll">
          <template v-if="filteredSchools.length">
            <el-card v-for="school in filteredSchools" :key="school.id" class="school-card">
              <div class="school-header">
                <div class="school-logo">
                  <img :src="school.imageUrl || defaultSchoolLogo" :alt="school.name">
                </div>
                <div class="school-title">
                  <h3>{{ school.name }}</h3>
                  <p class="school-location">{{ school.location }}</p>
                </div>
                <div class="school-actions">
                  <el-button 
                    type="primary" 
                    circle 
                    @click="toggleSavedSchool(school.id)"
                  >
                    <el-icon>
                      <component :is="isSaved(school.id) ? 'StarFilled' : 'Star'" />
                    </el-icon>
                  </el-button>
                </div>
              </div>
              
              <div class="school-stats">
                <div class="stat-item">
                  <span class="stat-label">排名</span>
                  <span class="stat-value">{{ school.ranking || '暂无' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">录取率</span>
                  <span class="stat-value">{{ formatPercentage(school.acceptanceRate) }}</span>
                </div>
              </div>
              
              <div class="school-footer">
                <el-button type="primary" text @click="viewSchoolDetail(school.id)">
                  查看详情
                </el-button>
              </div>
            </el-card>
          </template>
          
          <el-empty v-else-if="!loadingAll" description="没有找到符合条件的院校">
            <el-button @click="resetFilters">重置筛选条件</el-button>
          </el-empty>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="totalSchools > pageSize">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="totalSchools"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
    
    <!-- 偏好设置对话框 -->
    <el-dialog
      v-model="showPreferenceDialog"
      title="设置偏好"
      width="600px"
    >
      <el-form :model="preferences" label-position="top">
        <el-form-item label="国家/地区">
          <el-select
            v-model="preferences.country"
            multiple
            placeholder="选择国家/地区"
            style="width: 100%"
          >
            <el-option
              v-for="country in availableCountries"
              :key="country"
              :label="country"
              :value="country"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="排名范围">
          <el-slider
            v-model="preferences.ranking"
            range
            :min="1"
            :max="200"
            :marks="{1: '1', 50: '50', 100: '100', 150: '150', 200: '200+'}"
          />
        </el-form-item>
        
        <el-form-item label="专业方向">
          <el-select
            v-model="preferences.programs"
            multiple
            placeholder="选择专业方向"
            style="width: 100%"
          >
            <el-option
              v-for="program in availablePrograms"
              :key="program"
              :label="program"
              :value="program"
            />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPreferenceDialog = false">取消</el-button>
          <el-button type="primary" @click="savePreferences" :loading="savingPreferences">
            保存并生成推荐
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Star, StarFilled, Delete } from '@element-plus/icons-vue'
import RecommendationService from '@/api/services/recommendation'
import { UserService } from '@/api/services/user'
import { useAuthStore } from '@/stores/auth'
import type { School, RecommendationPreference, RecommendationRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 默认院校图标
const defaultSchoolLogo = 'https://via.placeholder.com/80x80?text=School'

// 标签页状态
const activeTab = ref('matched')

// 院校数据
const matchedSchools = ref<School[]>([])
const allSchools = ref<School[]>([])
const savedSchools = ref<School[]>([])
const savedSchoolIds = ref<number[]>([])

// 加载状态
const loading = ref(false)
const loadingSaved = ref(false)
const loadingAll = ref(false)
const savingPreferences = ref(false)

// 筛选状态
const searchQuery = ref('')
const countryFilter = ref('')
const programFilter = ref('')
const filteredSchools = ref<School[]>([])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const totalSchools = ref(0)

// 偏好设置
const showPreferenceDialog = ref(false)
const preferences = reactive<RecommendationPreference>({
  country: [],
  ranking: [1, 100],
  programs: []
})

// 可用选项
const availableCountries = ref<string[]>([])
const availablePrograms = ref<string[]>([])

// 计算属性
const isSaved = (schoolId: number) => {
  // 确保 savedSchoolIds.value 是数组
  if (!Array.isArray(savedSchoolIds.value)) {
    return false
  }
  return savedSchoolIds.value.includes(schoolId)
}

// 格式化百分比
const formatPercentage = (value?: number) => {
  if (value === undefined || value === null) return '暂无'
  return `${(value * 100).toFixed(1)}%`
}

// 限制文本长度
const limitText = (text: string, maxLength: number) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 获取匹配院校
const fetchMatchedSchools = async () => {
  if (!authStore.user?.id) return
  
  loading.value = true
  try {
    const schools = await RecommendationService.getSimpleRecommendations(authStore.user.id)
    matchedSchools.value = schools
  } catch (error) {
    console.error('获取匹配院校失败:', error)
    ElMessage.error('获取匹配院校失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取所有院校
const fetchAllSchools = async () => {
  loadingAll.value = true
  try {
    let accumulatedSchools: School[] = [];
    let currentPageNum = 0;
    const BATCH_SIZE = 50; // Fetch in batches of 50
    let totalPagesFromResponse = 0;

    do {
      const response = await RecommendationService.getAllSchools({ page: currentPageNum, size: BATCH_SIZE });
      if (response && response.content) {
        accumulatedSchools.push(...response.content);
        totalPagesFromResponse = response.totalPages; // Get total pages from response
        
        if (response.content.length < BATCH_SIZE || (currentPageNum + 1) >= totalPagesFromResponse) {
          break; // Break if last page fetched or less than batch size returned
        }
      } else {
        // No response or no content, break loop
        break;
      }
      currentPageNum++;
    } while (currentPageNum < totalPagesFromResponse);
    
    allSchools.value = accumulatedSchools;
    totalSchools.value = allSchools.value.length;

    // Reset to first page for client-side view and apply filters
    currentPage.value = 1; 
    applyClientSideFilters();

  } catch (error) {
    console.error('获取所有院校失败:', error)
    ElMessage.error('获取院校列表失败，请稍后重试')
    allSchools.value = []; // Clear on error
    totalSchools.value = 0;
  } finally {
    loadingAll.value = false
  }
}

// 获取可用的国家和专业选项
const fetchAvailableOptions = async () => {
  try {
    const [countries, programs] = await Promise.all([
      RecommendationService.getAvailableCountries(),
      RecommendationService.getAvailablePrograms()
    ])
    
    availableCountries.value = countries
    availablePrograms.value = programs
  } catch (error) {
    console.error('获取筛选选项失败:', error)
    ElMessage.error('获取筛选选项失败，请检查网络或联系管理员')
  }
}

// 获取已保存院校
const fetchSavedSchools = async () => {
  if (!authStore.user?.id) return
  
  loadingSaved.value = true
  try {
    const savedIds = await UserService.getSavedSchools(authStore.user.id)
    // 确保 savedIds 是数组，如果为空或非数组则设为空数组
    savedSchoolIds.value = Array.isArray(savedIds) ? savedIds : []
    
    if (savedSchoolIds.value.length > 0) {
      const schoolDetailsPromises = savedSchoolIds.value.map(id => 
        RecommendationService.getSchoolById(id)
      )
      const detailedSchools = await Promise.all(schoolDetailsPromises)
      savedSchools.value = detailedSchools.filter(school => school !== null) as School[]
    } else {
      savedSchools.value = []
    }
  } catch (error) {
    console.error('获取已保存院校失败:', error)
    ElMessage.error('获取已保存院校失败，请稍后重试')
    savedSchools.value = [] // Clear on error to avoid inconsistent state
    savedSchoolIds.value = [] // 确保这里也是空数组
  } finally {
    loadingSaved.value = false
  }
}

// 切换保存院校
const toggleSavedSchool = async (schoolId: number) => {
  if (!authStore.user?.id) {
    ElMessage.warning('请先登录')
    return
  }
  
  // 确保 savedSchoolIds.value 是数组
  if (!Array.isArray(savedSchoolIds.value)) {
    savedSchoolIds.value = []
  }
  
  const isSavedAlready = savedSchoolIds.value.includes(schoolId)
  
  try {
    await UserService.toggleSavedSchool(
      authStore.user.id, 
      schoolId, 
      !isSavedAlready
    )
    
    if (isSavedAlready) {
      savedSchoolIds.value = savedSchoolIds.value.filter(id => id !== schoolId)
      savedSchools.value = savedSchools.value.filter(school => school.id !== schoolId)
      ElMessage.success('已从收藏移除')
    } else {
      savedSchoolIds.value.push(schoolId)
      
      const schoolToAdd = allSchools.value.find(school => school.id === schoolId) || 
                          matchedSchools.value.find(school => school.id === schoolId) ||
                          await RecommendationService.getSchoolById(schoolId)
      if (schoolToAdd && !savedSchools.value.some(s => s.id === schoolId)) {
        savedSchools.value.push(schoolToAdd)
      }
      
      ElMessage.success('已添加到收藏')
    }
  } catch (error) {
    console.error('更新收藏失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 查看院校详情
const viewSchoolDetail = (schoolId: number) => {
  router.push(`/schools/${schoolId}`)
}

// 打开院校官网
const openSchoolWebsite = (website?: string) => {
  if (!website) {
    ElMessage.warning('未提供官方网站链接')
    return
  }
  
  // 确保URL包含协议
  const url = website.startsWith('http') ? website : `https://${website}`
  window.open(url, '_blank')
}

// 筛选院校
const filterSchools = async () => {
  currentPage.value = 1
  await fetchFilteredSchools()
}

// 获取筛选后的院校
const fetchFilteredSchools = async () => {
  loadingAll.value = true
  try {
    let schools: School[] = []
    let isApiFiltering = false // 标记是否使用了API筛选
    
    if (programFilter.value) {
      // 如果有专业筛选，调用专业筛选API
      console.log('调用专业筛选API，专业名称:', programFilter.value)
      const response = await RecommendationService.getSchoolsByProgram(programFilter.value, { page: 0, size: 1000 })
      console.log('专业筛选API返回:', response)
      schools = response.content || []
      isApiFiltering = true
    } else if (countryFilter.value) {
      // 如果有国家筛选，调用国家筛选API
      console.log('调用国家筛选API，国家名称:', countryFilter.value)
      const response = await RecommendationService.getSchoolsByCountry(countryFilter.value, { page: 0, size: 1000 })
      console.log('国家筛选API返回:', response)
      schools = response.content || []
      isApiFiltering = true
    } else {
      // 如果没有特定筛选，获取所有学校
      if (allSchools.value.length === 0) {
        await fetchAllSchools()
        return
      }
      schools = [...allSchools.value]
    }
    
    // 只有在搜索关键词存在且没有使用API筛选时，才进行客户端筛选
    if (searchQuery.value && !isApiFiltering) {
      schools = schools.filter(school => 
        school.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    } else if (searchQuery.value && isApiFiltering) {
      // 如果既有API筛选又有搜索关键词，在API结果基础上进行搜索筛选
      schools = schools.filter(school => 
        school.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    }
    
    console.log('最终筛选结果学校数量:', schools.length)
    totalSchools.value = schools.length
    allSchools.value = schools // 更新allSchools以保持一致性
    
    // 直接设置筛选后的学校列表，不再调用applyClientSideFilters
    const startIndex = (currentPage.value - 1) * pageSize.value
    const endIndex = startIndex + pageSize.value
    filteredSchools.value = schools.slice(startIndex, endIndex)
    
  } catch (error) {
    console.error('筛选院校失败:', error)
    ElMessage.error('筛选院校失败，请稍后重试')
  } finally {
    loadingAll.value = false
  }
}

// 搜索防抖
const debounceTimeout = ref<ReturnType<typeof setTimeout> | null>(null)
const debounceSearch = () => {
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value)
  }
  
  debounceTimeout.value = setTimeout(() => {
    filterSchools()
  }, 300)
}

// 搜索院校
const searchSchools = () => {
  filterSchools()
}

// 重置筛选条件
const resetFilters = async () => {
  searchQuery.value = ''
  countryFilter.value = ''
  programFilter.value = ''
  await fetchFilteredSchools()
}

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page
  applyClientSideFilters()
}

// 保存偏好设置
const savePreferences = async () => {
  if (!authStore.user?.id) { ElMessage.error('用户未登录'); return; }
  savingPreferences.value = true;
  try {
    const currentPreferences = preferences as RecommendationPreference; 

    // Use the updated RecommendationRequest type from @/types
    const payload: RecommendationRequest = {
        userId: authStore.user.id,
        locationPreferences: currentPreferences.country,
        rankingRange: currentPreferences.ranking, 
        targetMajor: currentPreferences.programs && currentPreferences.programs.length > 0 ? currentPreferences.programs[0] : undefined,
        // Add other scores from authStore.user if available and if backend DTO supports them
        // For now, focusing on preferences from the dialog
        count: 10, 
        recommendationType: 'SCHOOL'
    };

    const recommendationResult = await RecommendationService.generateRecommendation(payload);
    console.log('Generated recommendation result:', JSON.stringify(recommendationResult));
    
    if (Array.isArray(recommendationResult)) {
        matchedSchools.value = recommendationResult as School[];
    } else if (recommendationResult && (recommendationResult as any).items) {
        matchedSchools.value = (recommendationResult as any).items.map((item: any) => {
            return {
                id: item.schoolId,
                name: item.schoolName,
                location: item.schoolLocation,
                imageUrl: item.schoolLogo,
                ranking: item.schoolRanking,
                // Ensure all fields needed by School type are mapped here
            } as School; 
        });
    } else {
        console.warn('Unexpected structure from generateRecommendation', recommendationResult);
        matchedSchools.value = [];
    }

    activeTab.value = 'matched';
    showPreferenceDialog.value = false;
    ElMessage.success('偏好已保存，推荐已更新');
  } catch (error) {
    console.error('保存偏好并生成推荐失败:', error);
    ElMessage.error('操作失败');
  } finally {
    savingPreferences.value = false;
  }
};

// 监听标签页切换
const handleTabChange = (tabName: string | number) => {
  const currentTab = String(tabName)
  if (currentTab === 'saved') {
    if (!savedSchools.value.length && !loadingSaved.value) { // check if already loaded or loading
        fetchSavedSchools()
    }
  } else if (currentTab === 'all') {
    if (!allSchools.value.length && !loadingAll.value) { // check if already loaded or loading
      fetchAllSchools()
    } else if (allSchools.value.length > 0) { // if already loaded, just apply filters
      currentPage.value = 1; // Reset to page 1 when tabbing to 'all' with existing data
      filterSchools() 
    }
  } else if (currentTab === 'matched') {
    if (!matchedSchools.value.length && !loading.value) { // check if already loaded or loading
        fetchMatchedSchools()
    }
  }
}

// 组件挂载时执行
onMounted(async () => {
  await fetchAvailableOptions()
  await fetchMatchedSchools()
})

// 在script setup顶层监听标签页切换
watch(activeTab, handleTabChange)

// --- Filtering for 'all' tab ---
const applyClientSideFilters = () => {
  // 如果当前有专业或国家筛选，则不进行客户端筛选，因为已经通过API筛选了
  if (programFilter.value || countryFilter.value) {
    return
  }
  
  let tempSchools = [...allSchools.value]
  if (searchQuery.value) {
    tempSchools = tempSchools.filter(school => 
      school.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  
  totalSchools.value = tempSchools.length
  const startIndex = (currentPage.value - 1) * pageSize.value
  const endIndex = startIndex + pageSize.value
  filteredSchools.value = tempSchools.slice(startIndex, endIndex)
}
</script>

<style scoped lang="scss">
.recommendation-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #303133;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .tab-description {
    color: #606266;
    max-width: 70%;
    margin: 0;
  }
}

.filter-options {
  display: flex;
  gap: 10px;
  
  .el-input, .el-select {
    width: 200px;
  }
}

.schools-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.school-card {
  border-radius: 8px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .school-header {
    display: flex;
    margin-bottom: 16px;
    
    .school-logo {
      width: 60px;
      height: 60px;
      margin-right: 12px;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-radius: 4px;
      }
    }
    
    .school-title {
      flex: 1;
      
      h3 {
        margin: 0 0 4px;
        font-size: 18px;
        font-weight: 600;
      }
      
      .school-location {
        color: #909399;
        font-size: 14px;
        margin: 0;
      }
    }
    
    .school-actions {
      align-self: flex-start;
    }
  }
  
  .school-stats {
    display: flex;
    margin-bottom: 16px;
    
    .stat-item {
      flex: 1;
      text-align: center;
      
      .stat-label {
        display: block;
        font-size: 12px;
        color: #909399;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-size: 16px;
        font-weight: 500;
      }
    }
  }
  
  .school-programs {
    margin-bottom: 16px;
    
    h4 {
      font-size: 14px;
      margin: 0 0 8px;
      color: #606266;
    }
    
    .el-tag {
      margin-right: 8px;
      margin-bottom: 8px;
    }
  }
  
  .school-description {
    margin-bottom: 16px;
    flex: 1;
    
    p {
      margin: 0;
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
    }
  }
  
  .school-footer {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
  }
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style> 