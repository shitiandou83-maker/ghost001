import { generateMockProducts, Product } from '../types/index.js';

/**
 * 数据清洗与去重
 */
export function cleanProducts(products: Product[]): Product[] {
  const seen = new Set<string>();

  return products.filter((product) => {
    // 按名称和平台去重
    const key = `${product.name}_${product.platform}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * 按价格排序（从低到高）
 */
export function sortByPrice(products: Product[]): Product[] {
  return [...products].sort((a, b) => a.price - b.price);
}

/**
 * 性价比计算算法
 * 公式: (销量 * 0.3 + 评分 * 100 * 0.2) / 价格 * 10
 * 推荐阈值：得分 > 6 标记为推荐商品
 */
export function calculateScore(product: Product): number {
  return (product.sales * 0.3 + product.rating * 100 * 0.2) / product.price * 10;
}

/**
 * 标记高性价比商品
 * 阈值: 得分 > 6
 */
export function markRecommended(products: Product[]): Product[] {
  return products.map((p) => ({
    ...p,
    isRecommended: calculateScore(p) > 6,
  }));
}

/**
 * 价格区间统计
 */
export function getPriceRanges(products: Product[]): Record<string, number> {
  const ranges = {
    '0-1000': 0,
    '1000-2000': 0,
    '2000-3000': 0,
    '3000-5000': 0,
    '5000+': 0,
  };

  products.forEach((p) => {
    if (p.price < 1000) ranges['0-1000']++;
    else if (p.price < 2000) ranges['1000-2000']++;
    else if (p.price < 3000) ranges['2000-3000']++;
    else if (p.price < 5000) ranges['3000-5000']++;
    else ranges['5000+']++;
  });

  return ranges;
}

/**
 * 获取TOP性价比商品
 */
export function getTopProducts(products: Product[], count: number = 10): Product[] {
  return [...products]
    .filter((p) => p.isRecommended)
    .sort((a, b) => calculateScore(b) - calculateScore(a))
    .slice(0, count);
}

/**
 * 生成完整分析报告
 */
export function generateReport(keyword: string, limit: number) {
  const rawProducts = generateMockProducts(keyword, limit);
  const cleaned = cleanProducts(rawProducts);
  const sorted = sortByPrice(cleaned);
  const marked = markRecommended(sorted);
  const priceRanges = getPriceRanges(marked);
  const topProducts = getTopProducts(marked, 10);

  return {
    total: marked.length,
    recommended: marked.filter((p) => p.isRecommended).length,
    priceRanges,
    topProducts,
    products: marked,
  };
}
