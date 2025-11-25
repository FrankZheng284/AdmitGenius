<template>
  <div class="essay-detail-container">
    <div class="essay-header">
      <div class="header-content">
        <h1 class="essay-title">{{ essay.title }}</h1>
        <div class="essay-meta">
          <span class="essay-type" v-if="essay.essayType">{{ essay.essayType }}</span>
          <el-tag 
            :type="essay.status === 'COMPLETED' ? 'success' : 'warning'" 
            size="small" 
            class="essay-status-tag"
          >
            {{ essay.status === 'COMPLETED' ? '已完成' : '草稿' }}
          </el-tag>
          <span class="essay-date">{{ formatDate(essay.updatedAt || essay.createdAt) }}</span>
          <span class="essay-word-count">{{ wordCount }} 字</span>
          <span class="essay-word-limit" v-if="essay.wordLimit">
            限制: {{ essay.wordLimit }} 字
            <el-tag 
              :type="wordCount > essay.wordLimit ? 'danger' : 'success'" 
              size="small" 
              class="word-limit-tag"
            >
              {{ wordCount > essay.wordLimit ? '超出' : '符合' }}
            </el-tag>
          </span>
        </div>
      </div>
      <div class="header-actions">
        <el-button 
          v-if="essay.status !== 'COMPLETED'"
          type="success" 
          @click="markAsCompleted"
          :loading="updatingStatus"
        >
          <el-icon><Check /></el-icon>
          标记为完成
        </el-button>
        <el-button 
          v-else
          type="warning" 
          @click="markAsDraft"
          :loading="updatingStatus"
        >
          <el-icon><Edit /></el-icon>
          改为草稿
        </el-button>
        <el-button type="primary" @click="handleEdit">
          <el-icon><EditPen /></el-icon>
          编辑
        </el-button>
        <el-button type="success" @click="showPolishDialog = true">
          <el-icon><MagicStick /></el-icon>
          AI优化
        </el-button>
        <el-button type="warning" @click="goToPolishPage">
          <el-icon><Tools /></el-icon>
          高级润色
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <!-- 文书内容 -->
    <el-card class="essay-content-card" v-loading="loading">
      <div class="essay-content" v-html="formattedContent"></div>
    </el-card>

    <!-- 文书建议列表 -->
    <div class="suggestions-section" v-if="suggestions.length > 0">
      <h2 class="section-title">AI优化建议</h2>
      <el-timeline>
        <el-timeline-item
          v-for="suggestion in suggestions"
          :key="suggestion.id"
          :timestamp="formatDate(suggestion.createdAt)"
          type="primary"
        >
          <el-card class="suggestion-card">
            <div class="suggestion-content">
              <div class="original-text">
                <h4>原文</h4>
                <p>{{ suggestion.originalText }}</p>
              </div>
              <el-divider><el-icon><ArrowRight /></el-icon></el-divider>
              <div class="suggested-text">
                <h4>建议修改</h4>
                <p>{{ suggestion.suggestedText }}</p>
              </div>
            </div>
            <div class="suggestion-reason">
              <h4>修改理由</h4>
              <p>{{ suggestion.reason }}</p>
            </div>
            <div class="suggestion-actions">
              <el-button type="primary" size="small" @click="applySuggestion(suggestion)">
                应用修改
              </el-button>
              <el-button size="small" @click="ignoreSuggestion(suggestion.id)">
                忽略
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>

    <!-- AI优化对话框 -->
    <el-dialog
      v-model="showPolishDialog"
      title="AI优化文书"
      width="600px"
    >
      <el-form :model="polishForm" label-position="top">
        <el-form-item label="优化需求">
          <el-input
            v-model="polishForm.requirements"
            type="textarea"
            :rows="4"
            placeholder="请描述您的优化需求，例如：提高逻辑性、减少重复、增强文书吸引力等"
          />
        </el-form-item>
        <el-form-item>
          <el-radio-group v-model="polishForm.polishType">
            <el-radio value="全文优化" label="全文优化">全文优化</el-radio>
            <el-radio value="细节建议" label="细节建议">细节建议</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPolishDialog = false">取消</el-button>
          <el-button type="primary" @click="handlePolishEssay" :loading="polishing">
            开始优化
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 导出对话框 -->
    <el-dialog
      v-model="showExportDialog"
      title="导出文书"
      width="400px"
    >
      <el-form :model="exportForm" label-position="top">
        <el-form-item label="导出格式">
          <el-radio-group v-model="exportForm.format">
            <el-radio label="docx">Word文档(.docx)</el-radio>
            <el-radio label="pdf">PDF文件(.pdf)</el-radio>
            <el-radio label="txt">纯文本(.txt)</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showExportDialog = false">取消</el-button>
          <el-button type="primary" @click="executeExport" :loading="exporting">
            导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { EditPen, MagicStick, Download, ArrowRight, Tools, Check, Edit } from '@element-plus/icons-vue'
import { EssayService } from '@/api/services/essay'
import type { Essay, EssaySuggestion } from '@/types'
// 导入导出相关库
import { Document, Packer, Paragraph, TextRun } from 'docx'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const route = useRoute()
const router = useRouter()

// 状态
const loading = ref(false)
const polishing = ref(false)
const exporting = ref(false)
const updatingStatus = ref(false)
const showPolishDialog = ref(false)
const showExportDialog = ref(false)
const essay = ref<Essay>({
  id: 0,
  title: '',
  content: '',
  userId: 0
})
const suggestions = ref<EssaySuggestion[]>([])

// 表单
const polishForm = reactive({
  requirements: '',
  polishType: '细节建议'
})

const exportForm = reactive({
  format: 'docx'
})

// 计算字数
const wordCount = computed(() => {
  // 中文文本字数计算
  if (!essay.value.content) return 0
  
  // 去除HTML标签后计算
  const plainText = essay.value.content.replace(/<[^>]+>/g, '')
  return plainText.length
})

// 格式化显示的内容
const formattedContent = computed(() => {
  if (!essay.value.content) return ''
  
  // 如果内容没有HTML格式，添加段落格式
  if (!essay.value.content.includes('<')) {
    return essay.value.content.split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
      .join('')
  }
  
  return essay.value.content
})

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知日期'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取文书详情
const fetchEssayDetail = async () => {
  const essayId = Number(route.params.id)
  if (!essayId) {
    ElMessage.error('文书ID无效')
    return
  }
  
  loading.value = true
  try {
    // EssayService.getEssayById 现在直接返回 EssayDTO (或称 Essay 类型)
    const essayData = await EssayService.getEssayById(essayId)
    if (essayData && typeof essayData.id !== 'undefined') { // 检查 essayData 是否有效且包含id
      essay.value = essayData
    } else {
      console.error('获取文书详情失败: 返回的数据无效', essayData);
      ElMessage.error('获取文书详情失败')
    }
  } catch (error) {
    console.error('获取文书详情失败:', error)
    ElMessage.error('获取文书详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 获取优化建议
const fetchSuggestions = async () => {
  const essayId = Number(route.params.id)
  if (!essayId) return
  
  try {
    const response = await EssayService.getEssaySuggestions(essayId)
    if (response.data) {
      suggestions.value = response.data
    }
  } catch (error) {
    console.error('获取优化建议失败:', error)
  }
}

// 处理编辑
const handleEdit = () => {
  router.push(`/essay/edit/${essay.value.id}`)
}

// 前往高级润色页面
const goToPolishPage = () => {
  router.push(`/essay/polish/${essay.value.id}`)
}

// 处理文书优化
const handlePolishEssay = async () => {
  if (!polishForm.requirements.trim()) {
    ElMessage.warning('请描述您的优化需求')
    return
  }
  
  if (!essay.value.userId) {
    ElMessage.error('用户ID无效')
    return
  }
  
  polishing.value = true
  try {
    const polishPayload = {
      essayId: essay.value.id,
      userId: essay.value.userId,
      improveStructure: polishForm.polishType === '全文优化',
      enhanceLanguage: true,
      checkGrammar: true,
      reduceClichés: true,
      addExamples: true,
      customDescription: polishForm.requirements
    }
    
    const polishedEssay = await EssayService.polishEssay(essay.value.id, polishPayload)
    
    if (polishedEssay && typeof polishedEssay.content === 'string') {
      showPolishDialog.value = false
      ElMessage.success('文书已成功优化')
      
      if (essay.value) {
        essay.value.content = polishedEssay.content
        essay.value.updatedAt = polishedEssay.updatedAt
      }
      
      if (polishForm.polishType !== '全文优化') {
        await fetchSuggestions()
      }
      
      polishForm.requirements = ''
    } else {
      console.error('优化文书失败: 返回结果无效', polishedEssay)
    }
  } catch (error) {
    console.error('优化文书失败:', error)
    ElMessage.error('优化文书失败，请稍后重试')
  } finally {
    polishing.value = false
  }
}

// 应用建议
const applySuggestion = (suggestion: EssaySuggestion) => {
  if (!essay.value.content) return
  
  // 简单替换文本（实际场景可能需要更复杂的逻辑）
  essay.value.content = essay.value.content.replace(
    suggestion.originalText,
    suggestion.suggestedText
  )
  
  // 调用API保存更新
  // 为简化示例，这里省略了API调用
  ElMessage.success('已应用修改')
  
  // 从建议列表中移除
  suggestions.value = suggestions.value.filter(s => s.id !== suggestion.id)
}

// 忽略建议
const ignoreSuggestion = (suggestionId: number) => {
  // 从建议列表中移除
  suggestions.value = suggestions.value.filter(s => s.id !== suggestionId)
  ElMessage.success('已忽略该建议')
  
  // 实际场景中可能需要调用API更新建议状态
}

// 处理导出
const handleExport = () => {
  showExportDialog.value = true
}

// 执行导出
const executeExport = async () => {
  exporting.value = true
  
  try {
    const title = essay.value.title || '文书'
    const content = essay.value.content || ''
    
    // 清理HTML标签，获得纯文本
    const plainText = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
    
    if (exportForm.format === 'docx') {
      // 导出Word文档
      try {
        await exportToWord(title, plainText)
        ElMessage.success('Word文档导出成功')
      } catch (error) {
        console.warn('Word导出失败，尝试使用HTML格式:', error)
        // 如果Word导出失败，创建HTML文档作为备用
        exportToHTML(title, plainText)
        ElMessage.success('导出成功（HTML格式）')
      }
    } else if (exportForm.format === 'pdf') {
      // 导出PDF文档
      await exportToPDF(title, content)
      ElMessage.success('PDF导出成功')
    } else {
      // 导出纯文本
      exportToText(title, plainText)
      ElMessage.success('文本导出成功')
    }
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请重试')
  } finally {
    exporting.value = false
    showExportDialog.value = false
  }
}

// 导出Word文档
const exportToWord = async (title: string, content: string) => {
  try {
    // 将文本按段落分割
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0)
    
    // 创建Word文档
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // 标题
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32, // 16pt
              }),
            ],
            spacing: {
              after: 400,
            },
          }),
          // 内容段落
          ...paragraphs.map(para => 
            new Paragraph({
              children: [
                new TextRun({
                  text: para.trim(),
                  size: 24, // 12pt
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          ),
        ],
      }],
    })
    
    // 生成并下载 - 使用toBlob方法适应浏览器环境
    const blob = await Packer.toBlob(doc)
    
    // 验证blob是否生成成功
    if (!blob || blob.size === 0) {
      throw new Error('生成Word文档失败')
    }
    
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${title}.docx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('Word导出错误:', error)
    throw error
  }
}

// 导出PDF文档
const exportToPDF = async (title: string, content: string) => {
  try {
    // 创建一个临时的HTML元素来渲染内容
    const tempDiv = document.createElement('div')
    tempDiv.style.cssText = `
      position: absolute;
      left: -9999px;
      top: -9999px;
      width: 800px;
      padding: 40px;
      font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      background: white;
      box-sizing: border-box;
    `
    
    // 清理HTML标签，获得纯文本
    const plainText = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
    
    // 设置内容
    const formattedContent = plainText.split('\n\n').filter(p => p.trim().length > 0)
      .map(para => `<p style="margin-bottom: 16px; text-indent: 2em;">${para.trim()}</p>`)
      .join('')
    
    tempDiv.innerHTML = `
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 30px; text-align: center; color: #2c3e50;">
        ${title}
      </h1>
      <div style="text-align: justify;">
        ${formattedContent}
      </div>
    `
    
    // 添加到页面
    document.body.appendChild(tempDiv)
    
    // 使用html2canvas生成图片
    const canvas = await html2canvas(tempDiv, {
      scale: 2, // 提高清晰度
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    // 移除临时元素
    document.body.removeChild(tempDiv)
    
    // 创建PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210 // A4宽度
    const pageHeight = 297 // A4高度
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = 0
    
    // 添加第一页
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    // 如果内容超过一页，添加更多页面
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    // 下载PDF
    pdf.save(`${title}.pdf`)
  } catch (error) {
    console.error('PDF导出失败:', error)
    // 如果PDF导出失败，降级到文本导出
    exportToText(title, content)
    throw new Error('PDF导出失败，已自动转为文本格式')
  }
}

// 导出纯文本
const exportToText = (title: string, content: string) => {
  try {
    const textContent = `${title}\n\n${content}`
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${title}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (error) {
    console.error('文本导出失败:', error)
    throw error
  }
}

// 导出HTML文档
const exportToHTML = (title: string, content: string) => {
  // 创建HTML文档
  const htmlContent = `
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        <h1>${title}</h1>
        <div>${content}</div>
      </body>
    </html>
  `
  
  // 创建Blob对象
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
  
  // 创建下载链接
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${title}.html`
  
  // 添加到页面并触发下载
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 标记为完成
const markAsCompleted = async () => {
  if (!essay.value.id) return
  
  updatingStatus.value = true
  try {
    const updateData = {
      id: essay.value.id,
      status: 'COMPLETED'
    }
    
    await EssayService.updateEssay(essay.value.id, updateData)
    essay.value.status = 'COMPLETED'
    ElMessage.success('文书已标记为完成')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败，请重试')
  } finally {
    updatingStatus.value = false
  }
}

// 标记为草稿
const markAsDraft = async () => {
  if (!essay.value.id) return
  
  updatingStatus.value = true
  try {
    const updateData = {
      id: essay.value.id,
      status: 'DRAFT'
    }
    
    await EssayService.updateEssay(essay.value.id, updateData)
    essay.value.status = 'DRAFT'
    ElMessage.success('文书已标记为草稿')
  } catch (error) {
    console.error('更新状态失败:', error)
    ElMessage.error('更新状态失败，请重试')
  } finally {
    updatingStatus.value = false
  }
}

// 组件挂载时获取数据
onMounted(async () => {
  await fetchEssayDetail()
  await fetchSuggestions()
})
</script>

<style scoped lang="scss">
.essay-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.essay-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  
  .header-content {
    flex: 1;
    
    .essay-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #303133;
    }
    
    .essay-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      color: #909399;
      font-size: 14px;
      
      .essay-type {
        background-color: #ecf5ff;
        color: #409eff;
        padding: 2px 8px;
        border-radius: 4px;
      }
      
      .essay-status-tag {
        font-weight: 500;
      }
      
      .word-limit-tag {
        margin-left: 8px;
      }
    }
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.essay-content-card {
  margin-bottom: 30px;
  
  .essay-content {
    font-size: 16px;
    line-height: 1.8;
    color: #303133;
    
    p {
      margin-bottom: 16px;
    }
  }
}

.suggestions-section {
  margin-top: 40px;
  
  .section-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 20px;
    color: #303133;
  }
  
  .suggestion-card {
    margin-bottom: 16px;
    
    .suggestion-content {
      margin-bottom: 16px;
      
      h4 {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: #303133;
      }
      
      .original-text {
        background-color: #fdf6ec;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 12px;
        
        p {
          margin: 0;
          color: #e6a23c;
        }
      }
      
      .suggested-text {
        background-color: #f0f9eb;
        padding: 12px;
        border-radius: 4px;
        
        p {
          margin: 0;
          color: #67c23a;
        }
      }
    }
    
    .suggestion-reason {
      background-color: #f5f7fa;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      
      h4 {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 8px 0;
        color: #303133;
      }
      
      p {
        margin: 0;
        color: #606266;
      }
    }
    
    .suggestion-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
  }
}
</style> 