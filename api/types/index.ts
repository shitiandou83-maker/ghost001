// 商品数据结构
export interface Product {
  id: string;
  name: string;
  price: number;
  sales: number;
  rating: number;
  url: string;
  platform: '京东' | '淘宝' | '拼多多';
  crawlTime: string;
  isRecommended: boolean;
}

// 采集请求参数
export interface CrawlRequest {
  keyword: string;
  platforms: string[];
  limit: number;
}

// 采集响应
export interface CrawlResponse {
  success: boolean;
  data: Product[];
  message?: string;
}

// 平台类型
export type Platform = 'jd' | 'taobao' | 'pdd';

// 模拟商品数据生成
export function generateMockProducts(keyword: string, limit: number = 30): Product[] {
  const platforms: Array<'京东' | '淘宝' | '拼多多'> = ['京东', '淘宝', '拼多多'];
  const products: Product[] = [];

  const baseProducts = [
    { name: `${keyword} Pro Max 旗舰版`, priceBase: 4999 },
    { name: `${keyword} 标准版 官方标配`, priceBase: 2999 },
    { name: `${keyword} 青春版 轻薄设计`, priceBase: 1999 },
    { name: `${keyword} Ultra 超长续航`, priceBase: 5999 },
    { name: `${keyword} SE 性价比之选`, priceBase: 1499 },
    { name: `${keyword} Plus 大屏享受`, priceBase: 3999 },
    { name: `${keyword} Mini 便携小巧`, priceBase: 1299 },
    { name: `${keyword} Air 轻薄旗舰`, priceBase: 3499 },
    { name: `${keyword} Max 顶配版`, priceBase: 6999 },
    { name: `${keyword} 5G 全网通`, priceBase: 2499 },
  ];

  for (let i = 0; i < Math.min(limit, 50); i++) {
    const template = baseProducts[i % baseProducts.length];
    const platform = platforms[i % platforms.length];
    const priceVariation = Math.floor(Math.random() * 1000) - 500;
    const price = template.priceBase + priceVariation;
    const sales = Math.floor(Math.random() * 50000) + 100;
    const rating = 3.5 + Math.random() * 1.5;

    // 性价比计算：得分 > 6 标记为推荐
    const score = (sales * 0.3 + rating * 100 * 0.2) / price * 10;
    const isRecommended = score > 6;

    products.push({
      id: `${platform.toLowerCase()}_${i + 1001}`,
      name: template.name,
      price: Math.max(price, 99),
      sales,
      rating: Math.round(rating * 10) / 10,
      url: `https://item.${platform === '京东' ? 'jd' : platform === '淘宝' ? 'taobao' : 'pinduoduo'}.com/item.html?id=${i + 1001}`,
      platform,
      crawlTime: new Date().toISOString(),
      isRecommended,
    });
  }

  // 按价格排序
  return products.sort((a, b) => a.price - b.price);
}
