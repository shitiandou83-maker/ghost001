import express from 'express';
import { generateMockProducts, CrawlRequest } from './types/index.js';

const app = express();
const PORT = 3001;

app.use(express.json());

// CORS 头
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 采集接口
app.post('/api/crawl', (req, res) => {
  const { keyword, platforms = ['jd', 'taobao', 'pdd'], limit = 30 } = req.body as CrawlRequest;

  if (!keyword) {
    res.json({ success: false, message: '请提供搜索关键词', data: [] });
    return;
  }

  console.log(`[采集请求] 关键词: ${keyword}, 平台: ${platforms.join(',')}, 数量: ${limit}`);

  // 模拟采集延迟
  setTimeout(() => {
    const products = generateMockProducts(keyword, limit);

    // 平台映射
    const platformMap: Record<string, string> = {
      jd: '京东',
      taobao: '淘宝',
      pdd: '拼多多',
    };

    // 转换平台参数为中文
    const targetPlatforms = platforms.map(p => platformMap[p]).filter(Boolean);

    // 按平台筛选
    const filteredProducts = targetPlatforms.length > 0 && !platforms.includes('all')
      ? products.filter(p => targetPlatforms.includes(p.platform))
      : products;

    console.log(`[采集完成] 获取到 ${filteredProducts.length} 条商品数据`);

    res.json({
      success: true,
      data: filteredProducts,
      message: `成功采集 ${filteredProducts.length} 条商品信息`,
    });
  }, 1500);
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 价格采集API服务运行在 http://localhost:${PORT}`);
  console.log(`📡 监听采集请求...`);
});
