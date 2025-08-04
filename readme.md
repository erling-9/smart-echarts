# 智能交互式图表推荐系统

一个基于Vue.js + Node.js + DeepSeek AI的全栈应用，能够智能分析Excel/CSV数据并推荐最适合的**交互式ECharts图表**，提供丰富的图表交互体验。

## 🌟 功能特性

### 🤖 AI智能分析
- **智能图表推荐**: AI自动分析数据特征，推荐最适合的交互式图表类型
- **AI数据清理**: 自动处理缺失值、异常值和格式问题
- **数据洞察**: 提供深入的数据分析和趋势洞察
- **多语言支持**: 支持中文数据处理和分析

### 📊 丰富的交互式图表类型
- **交互式折线图**: 支持缩放、拖拽、数据点悬停显示详细信息
- **交互式柱状图**: 支持点击高亮、数据筛选、动态排序
- **交互式饼图**: 支持点击扇区高亮、标签显示、图例交互
- **交互式散点图**: 支持缩放、数据点选择、相关性分析
- **交互式雷达图**: 支持多维度对比、指标切换、动态更新
- **交互式热力图**: 支持密度分布、颜色映射、数据筛选
- **交互式漏斗图**: 支持流程转化分析、步骤点击、数据钻取
- **交互式仪表盘**: 支持实时数据更新、阈值设置、动画效果

### 🎮 图表交互功能
- **缩放和平移**: 支持鼠标滚轮缩放、拖拽平移
- **数据点悬停**: 鼠标悬停显示详细数据信息
- **点击交互**: 点击图表元素进行数据筛选和高亮
- **图例交互**: 点击图例显示/隐藏对应数据系列
- **工具提示**: 智能显示数据标签和统计信息
- **动画效果**: 流畅的图表渲染和更新动画
- **响应式设计**: 图表自动适配不同屏幕尺寸

### 📁 文件支持
- **Excel文件**: .xlsx, .xls
- **CSV文件**: .csv
- **拖拽上传**: 支持拖拽文件到上传区域
- **实时预览**: 即时生成和预览交互式图表

### 🎨 用户界面
- **现代化设计**: 基于Element Plus的优雅界面
- **响应式布局**: 适配不同屏幕尺寸
- **实时反馈**: 操作状态实时提示
- **图表交互**: 支持图表缩放、导出、分享等功能

## 🛠️ 技术栈

### 前端
- **Vue 3**: 渐进式JavaScript框架
- **Element Plus**: 基于Vue 3的组件库
- **ECharts 5**: 强大的交互式图表库
- **Vue-ECharts**: Vue 3的ECharts组件封装
- **Vite**: 快速的构建工具
- **Axios**: HTTP客户端

### 后端
- **Node.js**: JavaScript运行时
- **Express**: Web应用框架
- **Multer**: 文件上传处理
- **XLSX**: Excel文件解析
- **CSV-Parser**: CSV文件解析
- **DeepSeek API**: AI智能分析

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/erling-9/smart-echarts.git
cd smart-echarts
```

### 2. 安装依赖
```bash
# 安装所有依赖
npm run install-all

# 或者分别安装
npm install
cd server && npm install
cd ../client && npm install
```

### 3. 配置环境变量
```bash
# 复制环境变量模板
cp server/env.example server/.env

# 编辑.env文件，添加你的DeepSeek API密钥
DEEPSEEK_API_KEY=your_deepseek_api_key_here
PORT=3001
```

### 4. 启动项目
```bash
# 同时启动前端和后端
npm run dev

# 或者分别启动
npm run server  # 后端 (http://localhost:3001)
npm run client  # 前端 (http://localhost:3000)
```

### 5. 访问应用
- 前端: http://localhost:3000
- 后端API: http://localhost:3001

### 6. 快速体验交互式图表
1. 上传 `interactive-example.csv` 文件
2. 查看AI推荐的交互式图表类型
3. 选择"交互式折线图"或"交互式柱状图"
4. 体验以下交互功能：
   - 🖱️ 鼠标滚轮缩放图表
   - 🖱️ 拖拽平移视图
   - 🖱️ 悬停查看详细数据
   - 🖱️ 点击图例切换显示
   - 🖱️ 点击数据点高亮

## 📖 使用说明

### 1. 上传文件
- 支持Excel (.xlsx, .xls) 和 CSV 文件
- 拖拽文件到上传区域或点击选择文件
- 文件大小建议不超过10MB

### 2. AI分析
- 系统自动分析数据特征
- AI推荐最适合的交互式图表类型
- 提供详细的数据洞察

### 3. 选择交互式图表
- 从AI推荐的图表类型中选择
- 查看每种图表的适用场景说明
- 点击"生成图表"创建交互式可视化

### 4. 交互式图表操作
- **缩放**: 使用鼠标滚轮或双指手势进行缩放
- **平移**: 拖拽图表区域进行平移
- **悬停**: 鼠标悬停查看详细数据信息
- **点击**: 点击图表元素进行数据筛选
- **图例**: 点击图例显示/隐藏数据系列
- **导出**: 右键图表可导出为图片

### 5. 自定义图表
- 修改图表标题
- 调整图表样式和颜色
- 设置交互参数
- 导出图表图片

## 🔧 API接口

### POST /api/upload
上传文件并获取AI分析结果

**请求**:
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@your-data.csv"
```

**响应**:
```json
{
  "success": true,
  "data": [...],
  "recommendations": [...],
  "dataInsights": "...",
  "processingNotes": "...",
  "dataQuality": "..."
}
```

### POST /api/generate-chart
生成交互式图表配置

**请求**:
```json
{
  "data": [...],
  "chartType": "line",
  "title": "销售趋势图"
}
```

**响应**:
```json
{
  "success": true,
  "option": {
    "title": {...},
    "tooltip": {...},
    "legend": {...},
    "xAxis": {...},
    "yAxis": {...},
    "series": [...],
    "dataZoom": [...],
    "animation": true
  }
}
```

## 📁 项目结构

```
smart-echarts/
├── client/                 # 前端Vue.js应用
│   ├── src/
│   │   ├── App.vue        # 主应用组件（包含交互式图表）
│   │   └── main.js        # 应用入口
│   ├── index.html         # HTML模板
│   ├── package.json       # 前端依赖
│   └── vite.config.js     # Vite配置
├── server/                 # 后端Node.js应用
│   ├── index.js           # Express服务器
│   ├── package.json       # 后端依赖
│   └── env.example        # 环境变量示例
├── example-data.csv       # 示例数据文件
├── package.json           # 根项目配置
└── README.md             # 项目说明
```

## 🎯 支持的交互式图表类型

| 图表类型 | 适用场景 | 交互功能 | 数据要求 |
|---------|----------|----------|----------|
| **交互式折线图** | 趋势变化、时间序列 | 缩放、平移、悬停、点击、平滑动画 | 时间维度 + 数值 |
| **交互式柱状图** | 类别比较、排名 | 点击高亮、数据筛选、排序、圆角设计 | 分类数据 + 数值 |
| **交互式饼图** | 占比分析、构成 | 扇区点击、标签显示、图例交互、环形设计 | 分类数据 + 数值 |
| **交互式散点图** | 相关性分析 | 缩放、数据点选择、聚类、透明度调节 | 两个数值变量 |
| **交互式雷达图** | 多维度对比 | 指标切换、动态更新、多系列对比 | 多个数值指标 |
| **交互式热力图** | 密度分布 | 颜色映射、数据筛选、渐变效果 | 二维数据矩阵 |
| **交互式漏斗图** | 流程转化 | 步骤点击、数据钻取、流程分析 | 流程步骤 + 数值 |
| **交互式仪表盘** | 目标完成度 | 实时更新、阈值设置、动画效果 | 单一指标 |

## 🎮 交互式图表特性

### 缩放和平移
- **鼠标滚轮缩放**: 支持X轴和Y轴独立缩放
- **拖拽平移**: 在缩放状态下可拖拽移动视图
- **缩放重置**: 双击图表区域重置缩放状态

### 数据交互
- **悬停提示**: 鼠标悬停显示详细数据信息
- **点击高亮**: 点击数据点或图形元素进行高亮
- **图例交互**: 点击图例显示/隐藏对应数据系列

### 动画效果
- **渲染动画**: 图表初始渲染时的动画效果
- **更新动画**: 数据更新时的平滑过渡动画
- **交互动画**: 用户操作时的反馈动画

### 响应式设计
- **自适应布局**: 图表自动适配容器大小
- **移动端支持**: 支持触摸手势操作
- **多设备兼容**: 适配不同屏幕尺寸和分辨率

## 💰 费用说明

### DeepSeek API费用
- **输入费用**: $0.14 / 1M tokens
- **输出费用**: $0.28 / 1M tokens
- **单次处理**: 约 $0.0004 (比OpenAI便宜10倍)

### 使用建议
- 新用户有免费额度
- 建议先测试功能再充值
- 可以监控API使用量

## 🔒 安全说明

- API密钥存储在 `.env` 文件中
- `.env` 文件已加入 `.gitignore`
- 不会上传敏感信息到GitHub

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [Element Plus](https://element-plus.org/) - Vue 3组件库
- [ECharts](https://echarts.apache.org/) - 强大的交互式图表库
- [Vue-ECharts](https://github.com/ecomfe/vue-echarts) - Vue 3的ECharts组件
- [DeepSeek](https://platform.deepseek.com/) - AI API服务
- [Express](https://expressjs.com/) - Web应用框架

## 📞 联系方式

- 项目地址: https://github.com/erling-9/smart-echarts
- 问题反馈: [Issues](https://github.com/erling-9/smart-echarts/issues)

---

⭐ 如果这个项目对你有帮助，请给它一个星标！