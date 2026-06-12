#!/usr/bin/env node

import { parseArgs } from 'util';
import { generateMockProducts, Product } from '../api/types/index.js';
import { cleanProducts, sortByPrice, markRecommended, getTopProducts } from '../api/services/product.js';

/**
 * CLI 命令行工具
 *
 * 用法:
 *   pnpm cli --keyword "iPhone 15" --platforms jd,taobao --limit 50 --output result.json
 */

interface CliOptions {
  keyword: string;
  platforms: string[];
  limit: number;
  output: string;
  format: 'json' | 'csv';
}

function parsePlatforms(platformsStr: string): string[] {
  if (platformsStr === 'all') return ['jd', 'taobao', 'pdd'];
  return platformsStr.split(',').map((p) => p.trim().toLowerCase());
}

function formatAsCsv(products: Product[]): string {
  const headers = ['ID', '名称', '价格', '销量', '评分', '平台', 'URL', '推荐'];
  const rows = products.map((p) => [
    p.id,
    `"${p.name}"`,
    p.price.toString(),
    p.sales.toString(),
    p.rating.toString(),
    p.platform,
    p.url,
    p.isRecommended ? '是' : '否',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

async function main() {
  // 解析命令行参数
  const { values } = parseArgs({
    options: {
      keyword: { type: 'string', short: 'k' },
      platforms: { type: 'string', short: 'p', default: 'all' },
      limit: { type: 'string', short: 'l', default: '30' },
      output: { type: 'string', short: 'o', default: '' },
      format: { type: 'string', short: 'f', default: 'json' },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });

  const options: CliOptions = {
    keyword: values.keyword || '',
    platforms: parsePlatforms(values.platforms || 'all'),
    limit: parseInt(values.limit || '30', 10),
    output: values.output || '',
    format: (values.format as 'json' | 'csv') || 'json',
  };

  // 显示帮助
  if (values.help || !options.keyword) {
    console.log(`
🛒 电商价格采集CLI工具

用法:
  price-scraper --keyword <关键词> [选项]

选项:
  -k, --keyword     搜索关键词 (必填)
  -p, --platforms   目标平台: jd,taobao,pdd,all (默认: all)
  -l, --limit       采集数量上限 (默认: 30)
  -o, --output      输出文件路径 (默认: 标准输出)
  -f, --format      输出格式: json, csv (默认: json)
  -h, --help        显示帮助信息

示例:
  price-scraper --keyword "iPhone 15" --limit 50
  price-scraper -k "MacBook Pro" -p jd,taobao -o result.json -f csv
    `);
    process.exit(0);
  }

  console.log('🔍 开始采集商品数据...');
  console.log(`   关键词: ${options.keyword}`);
  console.log(`   平台: ${options.platforms.join(', ')}`);
  console.log(`   数量上限: ${options.limit}`);
  console.log('');

  try {
    // 生成模拟数据
    const rawProducts = generateMockProducts(options.keyword, options.limit);

    // 数据处理
    const cleaned = cleanProducts(rawProducts);
    const sorted = sortByPrice(cleaned);
    const marked = markRecommended(sorted);

    // 平台筛选
    const platformMap: Record<string, string> = {
      jd: '京东',
      taobao: '淘宝',
      pdd: '拼多多',
    };

    const filtered = marked.filter(
      (p) => options.platforms.length === 0 ||
        options.platforms.some(platform => platformMap[platform] === p.platform)
    );

    const topProducts = getTopProducts(filtered, 5);

    // 输出结果
    const outputData = {
      keyword: options.keyword,
      platforms: options.platforms,
      total: filtered.length,
      recommended: filtered.filter((p) => p.isRecommended).length,
      topProducts,
      products: filtered,
    };

    let output: string;
    if (options.format === 'csv') {
      output = formatAsCsv(filtered);
    } else {
      output = JSON.stringify(outputData, null, 2);
    }

    if (options.output) {
      // 写入文件
      const { writeFileSync } = await import('fs');
      writeFileSync(options.output, output, 'utf-8');
      console.log(`✅ 数据已保存到: ${options.output}`);
    } else {
      // 输出到标准输出
      console.log(output);
    }

    console.log('');
    console.log('📊 采集统计:');
    console.log(`   总商品数: ${filtered.length}`);
    console.log(`   性价比推荐: ${filtered.filter((p) => p.isRecommended).length}`);
    console.log('');
    console.log('🏆 TOP 5 性价比商品:');
    topProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ¥${p.price} (${p.platform})`);
    });
  } catch (error) {
    console.error('❌ 采集失败:', error);
    process.exit(1);
  }
}

main();
