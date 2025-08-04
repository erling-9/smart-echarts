<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>智能交互式图表推荐系统</h1>
        <p>上传Excel或CSV文件，AI自动推荐最适合的交互式ECharts图表类型</p>
      </el-header>
      
      <el-main>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>文件上传</span>
                </div>
              </template>
              
              <el-upload
                class="upload-demo"
                drag
                action="/api/upload"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :before-upload="beforeUpload"
                accept=".xlsx,.xls,.csv"
                :show-file-list="false"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  将文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 Excel (.xlsx, .xls) 和 CSV 文件，将生成交互式ECharts图表
                  </div>
                </template>
              </el-upload>
            </el-card>
          </el-col>
          
          <el-col :span="12">
            <el-card v-if="analysisResult">
              <template #header>
                <div class="card-header">
                  <span>AI分析结果</span>
                </div>
              </template>
              
              <div v-if="analysisResult.dataInsights" class="insights">
                <h4>数据洞察</h4>
                <p>{{ analysisResult.dataInsights }}</p>
              </div>
              
              <div v-if="analysisResult.processingNotes" class="processing-notes">
                <h4>数据处理说明</h4>
                <p>{{ analysisResult.processingNotes }}</p>
              </div>
              
              <div v-if="analysisResult.dataQuality" class="data-quality">
                <h4>数据质量</h4>
                <p>{{ analysisResult.dataQuality }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row v-if="analysisResult" :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>交互式图表推荐</span>
                </div>
              </template>
              
              <el-row :gutter="20">
                <el-col 
                  v-for="recommendation in analysisResult.recommendations" 
                  :key="recommendation.chartType"
                  :span="8"
                >
                  <el-card 
                    class="recommendation-card"
                    :class="{ 'selected': selectedChartType === recommendation.chartType }"
                    @click="selectChartType(recommendation.chartType)"
                  >
                    <h4>{{ getChartTypeName(recommendation.chartType) }}</h4>
                    <p>{{ recommendation.reason }}</p>
                    <el-button 
                      type="primary" 
                      size="small"
                      @click.stop="generateChart(recommendation.chartType)"
                    >
                      生成交互式图表
                    </el-button>
                  </el-card>
                </el-col>
              </el-row>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row v-if="chartOption" :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>交互式图表展示</span>
                  <el-input 
                    v-model="chartTitle" 
                    placeholder="输入图表标题"
                    style="width: 300px; margin-left: 20px;"
                    @input="updateChartTitle"
                  />
                </div>
              </template>
              
              <div class="chart-container">
                <div class="chart-tips">
                  <p>💡 交互提示：支持鼠标滚轮缩放、拖拽平移、悬停查看详情、点击图例切换显示</p>
                </div>
                <v-chart 
                  :option="chartOption" 
                  :style="{ height: '500px' }"
                />
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import VChart from 'vue-echarts'
import axios from 'axios'

// 导入ECharts组件
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册必需的组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'App',
  components: {
    VChart,
    UploadFilled
  },
  setup() {
    const analysisResult = ref(null)
    const chartOption = ref(null)
    const selectedChartType = ref('')
    const chartTitle = ref('')
    const currentData = ref(null)

    const handleUploadSuccess = (response) => {
      if (response.success) {
        analysisResult.value = response
        currentData.value = response.data
        ElMessage.success('文件上传成功，AI已分析完成！')
      } else {
        ElMessage.error(response.error || '上传失败')
      }
    }

    const handleUploadError = (error) => {
      console.error('上传错误:', error)
      ElMessage.error('文件上传失败，请检查文件格式')
    }

    const beforeUpload = (file) => {
      const isValidType = /\.(xlsx|xls|csv)$/.test(file.name.toLowerCase())
      if (!isValidType) {
        ElMessage.error('只支持 Excel 和 CSV 文件')
        return false
      }
      return true
    }

    const selectChartType = (chartType) => {
      selectedChartType.value = chartType
    }

    const getChartTypeName = (chartType) => {
      const names = {
        'line': '交互式折线图',
        'bar': '交互式柱状图',
        'pie': '交互式饼图',
        'scatter': '交互式散点图',
        'radar': '交互式雷达图',
        'heatmap': '交互式热力图',
        'funnel': '交互式漏斗图',
        'gauge': '交互式仪表盘'
      }
      return names[chartType] || chartType
    }

    const generateChart = async (chartType) => {
      try {
        const response = await axios.post('/api/generate-chart', {
          data: currentData.value,
          chartType: chartType,
          title: chartTitle.value || getChartTypeName(chartType)
        })
        
        if (response.data.success) {
          // 增强交互式配置
          const option = response.data.option
          
          // 添加交互式工具提示
          if (!option.tooltip) {
            option.tooltip = {
              trigger: 'axis',
              axisPointer: {
                type: 'cross'
              }
            }
          }
          
          // 添加缩放功能
          if (!option.dataZoom) {
            option.dataZoom = [
              {
                type: 'inside',
                start: 0,
                end: 100
              },
              {
                type: 'slider',
                start: 0,
                end: 100
              }
            ]
          }
          
          // 添加动画效果
          option.animation = true
          option.animationDuration = 1000
          option.animationEasing = 'cubicOut'
          
          chartOption.value = option
          selectedChartType.value = chartType
          ElMessage.success('交互式图表生成成功！支持缩放、平移、悬停等交互功能')
        }
      } catch (error) {
        console.error('生成图表错误:', error)
        ElMessage.error('生成交互式图表失败')
      }
    }

    const updateChartTitle = () => {
      if (chartOption.value && selectedChartType.value) {
        generateChart(selectedChartType.value)
      }
    }

    return {
      analysisResult,
      chartOption,
      selectedChartType,
      chartTitle,
      handleUploadSuccess,
      handleUploadError,
      beforeUpload,
      selectChartType,
      getChartTypeName,
      generateChart,
      updateChartTitle
    }
  }
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 40px 20px;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.el-header h1 {
  margin: 0 0 15px 0;
  font-size: 3em;
  font-weight: 600;
}

.el-header p {
  margin: 0;
  font-size: 1.4em;
  opacity: 0.9;
  line-height: 1.5;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-demo {
  width: 100%;
}

.recommendation-card {
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 10px;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.recommendation-card.selected {
  border: 2px solid #409eff;
  background-color: #f0f9ff;
}

.insights, .processing-notes, .data-quality {
  margin-bottom: 15px;
}

.insights h4, .processing-notes h4, .data-quality h4 {
  color: #409eff;
  margin-bottom: 8px;
}

.chart-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chart-tips {
  margin-bottom: 15px;
  padding: 10px 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-tips p {
  margin: 0;
  opacity: 0.9;
}

.el-upload__tip {
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
}
</style> 