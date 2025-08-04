const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const csv = require('csv-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('只支持 Excel 和 CSV 文件'));
    }
  }
});

// 初始化 DeepSeek API
let deepseekApiKey = process.env.DEEPSEEK_API_KEY;
if (!deepseekApiKey) {
  console.log('⚠️  DeepSeek API密钥未配置，AI功能将不可用');
}

// 读取Excel文件
function readExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    return data;
  } catch (error) {
    throw new Error('读取Excel文件失败: ' + error.message);
  }
}

// 读取CSV文件
function readCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// 使用AI分析数据并推荐图表类型
async function analyzeDataAndRecommendCharts(data) {
  try {
    const prompt = `
作为数据可视化专家，请分析以下数据并推荐最适合的交互式图表类型：

完整数据（${data.length}行）：
${JSON.stringify(data, null, 2)}

数据特征：
- 总行数: ${data.length}
- 列数: ${data[0] ? data[0].length : 0}
- 列名: ${data[0] ? Object.keys(data[0]).join(', ') : '无'}
- 数据范围: 从 ${data[0]?.[Object.keys(data[0])[0]]} 到 ${data[data.length-1]?.[Object.keys(data[0])[0]]}

请从以下交互式图表类型中选择最适合的3-5种，考虑用户交互体验：
- line: 交互式折线图（适合趋势变化，支持缩放、悬停、点击）
- bar: 交互式柱状图（适合类别比较，支持点击高亮、数据筛选）
- pie: 交互式饼图（适合占比分析，支持扇区点击、图例交互）
- scatter: 交互式散点图（适合相关性分析，支持缩放、数据点选择）
- radar: 交互式雷达图（适合多维度对比，支持指标切换）
- heatmap: 交互式热力图（适合密度分布，支持颜色映射）
- funnel: 交互式漏斗图（适合流程转化，支持步骤点击）
- gauge: 交互式仪表盘（适合单一指标，支持实时更新）

请详细分析数据特征，并给出具体的推荐理由。返回格式：
{
  "recommendations": [
    {
      "chartType": "图表类型",
      "reason": "详细推荐原因，包括数据特征分析和适用场景说明",
      "suitable": true
    }
  ],
  "dataInsights": "对数据的深入洞察，包括数据特征、趋势分析、异常发现等"
}`;

    if (!deepseekApiKey) {
      throw new Error('DeepSeek API密钥未配置');
    }

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    let content = response.data.choices[0].message.content;
    
    // 处理可能的markdown格式
    if (content.includes('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // 尝试提取JSON部分
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // 如果解析失败，尝试提取JSON对象
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('AI分析失败:', error);
    // 返回默认推荐
    return {
      recommendations: [
        {
          chartType: "line",
          reason: "适合展示趋势变化，能够清晰显示数据随时间或其他连续变量的变化趋势",
          suitable: true
        },
        {
          chartType: "bar",
          reason: "适合比较不同类别的数值大小，便于直观对比各项数据",
          suitable: true
        },
        {
          chartType: "pie",
          reason: "适合展示占比关系，能够突出显示各部分在整体中的比例",
          suitable: true
        },
        {
          chartType: "scatter",
          reason: "适合展示两个变量之间的关系，能够发现数据间的相关性",
          suitable: true
        },
        {
          chartType: "radar",
          reason: "适合多维度数据对比，能够同时展示多个指标的表现",
          suitable: true
        },
        {
          chartType: "heatmap",
          reason: "适合展示二维数据的密度分布，能够直观显示数据的热点区域",
          suitable: true
        },
        {
          chartType: "funnel",
          reason: "适合展示流程转化，能够清晰显示各环节的转化情况",
          suitable: true
        },
        {
          chartType: "gauge",
          reason: "适合展示单一指标的目标完成度，能够直观显示进度状态",
          suitable: true
        }
      ],
      dataInsights: "数据已成功解析，请根据数据特征选择合适的图表类型进行可视化"
    };
  }
}

// 使用AI清理数据
async function cleanDataWithAI(data) {
  try {
    if (!deepseekApiKey) {
      return {
        cleanedData: data,
        processingNotes: "DeepSeek API密钥未配置，使用原始数据",
        dataQuality: "数据质量待评估"
      };
    }

    const prompt = `
请清理以下数据，处理缺失值、异常值和格式问题：

完整数据（${data.length}行）：
${JSON.stringify(data, null, 2)}

数据信息：
- 总行数: ${data.length}
- 列数: ${data[0] ? data[0].length : 0}
- 列名: ${data[0] ? Object.keys(data[0]).join(', ') : '无'}

请返回清理后的完整数据和处理说明。返回格式：
{
  "cleanedData": [清理后的完整数据，包含所有${data.length}行],
  "processingNotes": "处理说明",
  "dataQuality": "数据质量评估"
}`;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    let content = response.data.choices[0].message.content;
    
    // 处理可能的markdown格式
    if (content.includes('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    
    // 尝试提取JSON部分
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // 如果解析失败，尝试提取JSON对象
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw parseError;
    }
  } catch (error) {
    console.error('AI数据清理失败:', error);
    return {
      cleanedData: data,
      processingNotes: "数据清理过程中出现错误，使用原始数据",
      dataQuality: "数据质量待评估"
    };
  }
}

// API路由

// 文件上传和数据分析
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择文件' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    
    let data;
    
    if (fileExt === '.csv') {
      data = await readCSVFile(filePath);
    } else {
      data = readExcelFile(filePath);
    }

    if (!data || data.length === 0) {
      return res.status(400).json({ error: '文件内容为空' });
    }

    // AI数据清理
    const cleanedData = await cleanDataWithAI(data);
    
    // AI图表推荐
    const recommendations = await analyzeDataAndRecommendCharts(cleanedData.cleanedData);

    // 清理临时文件
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      data: cleanedData.cleanedData,
      recommendations: recommendations.recommendations,
      dataInsights: recommendations.dataInsights,
      processingNotes: cleanedData.processingNotes,
      dataQuality: cleanedData.dataQuality
    });

  } catch (error) {
    console.error('文件处理错误:', error);
    res.status(500).json({ error: '文件处理失败: ' + error.message });
  }
});

// 获取图表配置
app.post('/api/generate-chart', (req, res) => {
  try {
    const { data, chartType, title } = req.body;
    
    if (!data || !chartType) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 根据图表类型生成ECharts配置
    let option = {};
    
    switch (chartType) {
      case 'line':
        option = generateLineChartOption(data, title);
        break;
      case 'bar':
        option = generateBarChartOption(data, title);
        break;
      case 'pie':
        option = generatePieChartOption(data, title);
        break;
      case 'scatter':
        option = generateScatterChartOption(data, title);
        break;
      case 'radar':
        option = generateRadarChartOption(data, title);
        break;
      case 'heatmap':
        option = generateHeatmapChartOption(data, title);
        break;
      case 'funnel':
        option = generateFunnelChartOption(data, title);
        break;
      case 'gauge':
        option = generateGaugeChartOption(data, title);
        break;
      default:
        option = generateBarChartOption(data, title);
    }

    res.json({ success: true, option });
  } catch (error) {
    console.error('生成图表配置错误:', error);
    res.status(500).json({ error: '生成图表配置失败' });
  }
});

// 生成折线图配置
function generateLineChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const xAxisData = data.map((row, index) => row[columns[0]] || `数据${index + 1}`);
  const series = columns.slice(1).map(col => ({
    name: col,
    type: 'line',
    data: data.map(row => row[col]),
    smooth: true,
    symbol: 'circle',
    symbolSize: 6
  }));

  return {
    title: { text: title || '交互式折线图' },
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: { 
      data: columns.slice(1),
      selectedMode: true
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: xAxisData,
      boundaryGap: false
    },
    yAxis: { type: 'value' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: series,
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
}

// 生成交互式柱状图配置
function generateBarChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const xAxisData = data.map((row, index) => row[columns[0]] || `数据${index + 1}`);
  const series = columns.slice(1).map(col => ({
    name: col,
    type: 'bar',
    data: data.map(row => row[col]),
    itemStyle: {
      borderRadius: [4, 4, 0, 0]
    }
  }));

  return {
    title: { text: title || '交互式柱状图' },
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: { 
      data: columns.slice(1),
      selectedMode: true
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: xAxisData,
      axisLabel: { rotate: 45 }
    },
    yAxis: { type: 'value' },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: series,
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
}

// 生成交互式饼图配置
function generatePieChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const series = columns.map(col => ({
    name: col,
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '50%'],
    data: data.map(row => ({ name: row[columns[0]], value: row[col] })),
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)'
      }
    }
  }));

  return {
    title: { text: title || '交互式饼图' },
    tooltip: { 
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: { 
      orient: 'vertical', 
      left: 'left',
      selectedMode: true
    },
    series: series,
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
}

// 生成交互式散点图配置
function generateScatterChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  if (columns.length < 2) return generateBarChartOption(data, title);
  
  return {
    title: { text: title || '交互式散点图' },
    tooltip: { 
      trigger: 'item',
      formatter: function(params) {
        return `${params.seriesName}<br/>${columns[0]}: ${params.value[0]}<br/>${columns[1]}: ${params.value[1]}`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { 
      type: 'value',
      name: columns[0],
      nameLocation: 'middle',
      nameGap: 30
    },
    yAxis: { 
      type: 'value',
      name: columns[1],
      nameLocation: 'middle',
      nameGap: 30
    },
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { type: 'slider', start: 0, end: 100 }
    ],
    series: [{
      name: '散点',
      type: 'scatter',
      data: data.map(row => [row[columns[0]], row[columns[1]]]),
      symbolSize: 8,
      itemStyle: {
        opacity: 0.8
      }
    }],
    animation: true,
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  };
}

// 生成雷达图配置
function generateRadarChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const indicators = columns.slice(1).map(col => ({ name: col, max: Math.max(...data.map(row => parseFloat(row[col]) || 0)) }));
  
  return {
    title: { text: title || '雷达图' },
    tooltip: { trigger: 'item' },
    legend: { data: data.map(row => row[columns[0]]) },
    radar: {
      indicator: indicators
    },
    series: [{
      name: '数据',
      type: 'radar',
      data: data.map(row => ({
        name: row[columns[0]],
        value: columns.slice(1).map(col => parseFloat(row[col]) || 0)
      }))
    }]
  };
}

// 生成热力图配置
function generateHeatmapChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const xAxisData = columns.slice(1);
  const yAxisData = data.map(row => row[columns[0]]);
  
  const heatmapData = [];
  data.forEach((row, i) => {
    columns.slice(1).forEach((col, j) => {
      heatmapData.push([j, i, parseFloat(row[col]) || 0]);
    });
  });
  
  return {
    title: { text: title || '热力图' },
    tooltip: { position: 'top' },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'category', data: yAxisData },
    visualMap: {
      min: 0,
      max: Math.max(...data.map(row => Math.max(...columns.slice(1).map(col => parseFloat(row[col]) || 0)))),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: '数据',
      type: 'heatmap',
      data: heatmapData,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  };
}

// 生成漏斗图配置
function generateFunnelChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const funnelData = data.map(row => ({
    name: row[columns[0]],
    value: parseFloat(row[columns[1]]) || 0
  })).sort((a, b) => b.value - a.value);
  
  return {
    title: { text: title || '漏斗图' },
    tooltip: { trigger: 'item' },
    series: [{
      name: '数据',
      type: 'funnel',
      left: '10%',
      top: 60,
      width: '80%',
      height: '80%',
      min: 0,
      max: Math.max(...funnelData.map(item => item.value)),
      minSize: '0%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: { show: true, position: 'inside' },
      labelLine: { length: 10, lineStyle: { width: 1, type: 'solid' } },
      itemStyle: { borderColor: '#fff', borderWidth: 1 },
      emphasis: { label: { fontSize: 20 } },
      data: funnelData
    }]
  };
}

// 生成仪表盘配置
function generateGaugeChartOption(data, title) {
  const columns = Object.keys(data[0] || {});
  const value = parseFloat(data[0]?.[columns[1]]) || 0;
  const max = Math.max(...data.map(row => parseFloat(row[columns[1]]) || 0));
  
  return {
    title: { text: title || '仪表盘' },
    tooltip: { formatter: '{a} <br/>{b} : {c}%' },
    series: [{
      name: columns[1] || '指标',
      type: 'gauge',
      detail: { formatter: '{value}%' },
      data: [{ value: (value / max) * 100, name: data[0]?.[columns[0]] || '当前值' }],
      axisLabel: { formatter: '{value}%' },
      max: 100
    }]
  };
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
}); 