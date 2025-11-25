<template>
  <div class="school-list-container">
    <div class="page-header">
      <h2 class="page-title">院校库</h2>
      <el-input
        v-model="searchQuery"
        placeholder="搜索院校名称"
        class="search-input"
        clearable
        prefix-icon="Search"
        @input="handleSearch"
      />
    </div>

    <div class="filter-container">
      <el-card shadow="never" class="filter-card">
        <div class="filters">
          <div class="filter-section">
            <div class="filter-label">国家/地区：</div>
            <el-select v-model="filters.country" placeholder="全部" clearable @change="applyFilters">
              <el-option label="美国" value="美国" />
              <el-option label="英国" value="英国" />
              <el-option label="加拿大" value="加拿大" />
              <el-option label="澳大利亚" value="澳大利亚" />
              <el-option label="中国香港" value="中国香港" />
              <el-option label="新加坡" value="新加坡" />
              <el-option label="德国" value="德国" />
              <el-option label="法国" value="法国" />
              <el-option label="日本" value="日本" />
              <el-option label="韩国" value="韩国" />
            </el-select>
          </div>

          <div class="filter-section">
            <div class="filter-label">排名范围：</div>
            <el-select v-model="filters.ranking" placeholder="全部" clearable @change="applyFilters">
              <el-option label="Top 10" value="10" />
              <el-option label="Top 50" value="50" />
              <el-option label="Top 100" value="100" />
              <el-option label="Top 200" value="200" />
            </el-select>
          </div>

          <div class="filter-actions">
            <el-button type="primary" @click="applyFilters" :loading="loading">
              <el-icon><Search /></el-icon>
              筛选
            </el-button>
            <el-button @click="resetFilters" :disabled="!hasActiveFilters">
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>
        </div>
        
        <!-- 活跃筛选条件标签 -->
        <div class="active-filters" v-if="hasActiveFilters">
          <div class="active-filters-title">当前筛选：</div>
          <div class="filter-tags">
            <el-tag
              v-if="searchQuery"
              closable
              @close="searchQuery = ''; handleSearch()"
              type="info"
            >
              搜索：{{ searchQuery }}
            </el-tag>
            <el-tag
              v-if="filters.country"
              closable
              @close="filters.country = ''; applyFilters()"
              type="primary"
            >
              国家：{{ filters.country }}
            </el-tag>
            <el-tag
              v-if="filters.ranking"
              closable
              @close="filters.ranking = ''; applyFilters()"
              type="success"
            >
              排名：Top {{ filters.ranking }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 搜索结果统计 -->
    <div class="search-result-info" v-if="!loading">
      <div class="result-count">
        <el-icon><Document /></el-icon>
        <span>找到 <strong>{{ filteredSchools.length }}</strong> 所院校</span>
        <span v-if="hasActiveFilters" class="filter-hint">（已应用筛选条件）</span>
      </div>
    </div>

    <div class="school-list">
      <el-skeleton :loading="loading" animated :count="6" v-if="loading">
        <template #template>
          <div style="display: flex; width: 100%;">
            <el-skeleton-item variant="image" style="width: 80px; height: 80px; margin-right: 16px;"/>
            <div style="flex: 1">
              <el-skeleton-item variant="h3" style="width: 50%; margin-bottom: 10px"/>
              <el-skeleton-item variant="text" style="width: 80%; margin-bottom: 5px"/>
              <el-skeleton-item variant="text" style="width: 60%;"/>
            </div>
          </div>
        </template>
      </el-skeleton>

      <transition-group name="fade" tag="div" class="school-grid">
        <el-card
          v-for="school in displayedSchools"
          :key="school.id"
          class="school-card"
          shadow="hover"
          @click="goToSchoolDetail(school.id)"
        >
          <div class="school-card-content">
            <div class="school-logo">
              <img :src="school.imageUrl || '/src/assets/images/default-school.png'" :alt="school.name" />
            </div>
            <div class="school-info">
              <h3 class="school-name">{{ school.name }}</h3>
              <div class="school-meta">
                <div class="meta-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ school.location }}</span>
                </div>
                <div class="meta-item" v-if="school.ranking">
                  <el-icon><Trophy /></el-icon>
                  <span>世界排名: {{ school.ranking }}</span>
                </div>
                <div class="meta-item" v-if="school.acceptanceRate">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>录取率: {{ (school.acceptanceRate * 100).toFixed(1) }}%</span>
                </div>
              </div>
            </div>
            <div class="school-action">
              <el-button type="primary" text>查看详情</el-button>
            </div>
          </div>
        </el-card>
      </transition-group>

      <el-empty v-if="!loading && displayedSchools.length === 0" description="没有找到符合条件的院校" />

      <div class="pagination-container" v-if="filteredSchools.length > pageSize">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="filteredSchools.length"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Search, Location, Trophy, DataAnalysis, RefreshLeft, Document } from '@element-plus/icons-vue';
import RecommendationService from '@/api/services/recommendation';
import type { School } from '@/types';

const router = useRouter();
const loading = ref(true);
const schools = ref<School[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(9);

// 筛选条件
const filters = reactive({
  country: '',
  ranking: '',
});

// 检查是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return searchQuery.value || filters.country || filters.ranking;
});

// 获取所有学校数据
const fetchSchools = async () => {
  try {
    loading.value = true;
    let accumulatedSchools: School[] = [];
    let currentPageNum = 0;
    const BATCH_SIZE = 50; // Fetch in batches, adjust as needed
    let totalPagesFromResponse = 0;

    do {
      // Assuming getAllSchools accepts pagination params { page: number, size: number }
      const response = await RecommendationService.getAllSchools({ page: currentPageNum, size: BATCH_SIZE });
      if (response && response.content) {
        accumulatedSchools.push(...response.content);
        totalPagesFromResponse = response.totalPages;

        if (response.content.length < BATCH_SIZE || (currentPageNum + 1) >= totalPagesFromResponse) {
          break; // Last page fetched or less than batch size returned
        }
      } else {
        break; // No response or no content, break loop
      }
      currentPageNum++;
    } while (currentPageNum < totalPagesFromResponse);

    schools.value = accumulatedSchools;
  } catch (error) {
    console.error('Failed to fetch schools:', error);
    schools.value = []; // Clear schools on error
  } finally {
    loading.value = false;
  }
};

// 根据搜索关键词和筛选条件过滤学校
const filteredSchools = computed(() => {
  return schools.value.filter(school => {
    // 搜索关键词筛选
    if (searchQuery.value && !school.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
      return false;
    }
    
    // 国家筛选
    if (filters.country && school.location && !school.location.toLowerCase().includes(filters.country.toLowerCase())) {
      return false;
    }
    
    // 排名筛选
    if (filters.ranking && (school.ranking === undefined || school.ranking > parseInt(filters.ranking))) {
      return false;
    }
    
    return true;
  });
});

// 分页显示的学校
const displayedSchools = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredSchools.value.slice(start, end);
});

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1;
};

// 应用筛选条件
const applyFilters = () => {
  currentPage.value = 1;
};

// 重置筛选条件
const resetFilters = () => {
  searchQuery.value = '';
  filters.country = '';
  filters.ranking = '';
  currentPage.value = 1;
};

// 处理分页
const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 跳转到学校详情页
const goToSchoolDetail = (id: number) => {
  router.push(`/schools/${id}`);
};

onMounted(() => {
  fetchSchools();
});
</script>

<style scoped lang="scss">
.school-list-container {
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.search-input {
  width: 300px;
}

.filter-container {
  margin-bottom: 24px;
}

.filter-card {
  background-color: #f5f7fa;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.school-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.school-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.school-card-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.school-logo {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
  
  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    border-radius: 50%;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }
}

.school-info {
  flex: 1;
}

.school-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
  text-align: center;
}

.school-meta {
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;
  
  .el-icon {
    color: #409EFF;
  }
}

.school-action {
  display: flex;
  justify-content: center;
  margin-top: auto;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.active-filters-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-result-info {
  margin-bottom: 20px;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.result-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  
  .el-icon {
    color: #409EFF;
  }
  
  strong {
    color: #303133;
    font-weight: 600;
  }
}

.filter-hint {
  color: #909399;
  font-size: 13px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .filters {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-section {
    width: 100%;
  }
  
  .filter-actions {
    width: 100%;
    margin-left: 0;
    justify-content: center;
  }
  
  .filter-tags {
    justify-content: flex-start;
  }
  
  .search-result-info {
    text-align: center;
  }
  
  .school-grid {
    grid-template-columns: 1fr;
  }
}
</style> 