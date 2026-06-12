import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Search, ShoppingCart, Star, TrendingUp, Crown, Filter, Copy, Check } from 'lucide-react';
import { useProductStore, sampleProducts, Product } from '@/stores/productStore';
import { clsx } from 'clsx';

// 平台颜色映射
const platformColors: Record<string, { bg: string; text: string; border: string }> = {
  '京东': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  '淘宝': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/50' },
  '拼多多': { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
};

export default function Home() {
  const { products, loading, error, keyword, platforms, setKeyword, setPlatforms, fetchProducts } = useProductStore();
  const [localKeyword, setLocalKeyword] = useState('iPhone 15');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['jd', 'taobao', 'pdd']);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 使用示例数据或真实数据
  const displayProducts = products.length > 0 ? products : sampleProducts;

  // 价格统计
  const priceStats = {
    min: displayProducts.length > 0 ? Math.min(...displayProducts.map(p => p.price)) : 0,
    max: displayProducts.length > 0 ? Math.max(...displayProducts.map(p => p.price)) : 0,
    avg: displayProducts.length > 0 ? Math.round(displayProducts.reduce((sum, p) => sum + p.price, 0) / displayProducts.length) : 0,
    recommended: displayProducts.filter(p => p.isRecommended).length,
  };

  // 处理平台选择
  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  // 执行搜索
  const handleSearch = async () => {
    setKeyword(localKeyword);
    setPlatforms(selectedPlatforms);
    await fetchProducts(localKeyword, selectedPlatforms);
  };

  // 复制链接
  const copyUrl = async (product: Product) => {
    await navigator.clipboard.writeText(product.url);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 初始化加载示例数据
  useEffect(() => {
    if (products.length === 0) {
      useProductStore.setState({ products: sampleProducts });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 顶部导航 */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">价格猎手</h1>
                <p className="text-xs text-slate-400">电商价格采集与对比</p>
              </div>
            </div>
            <div className="text-sm text-slate-400">
              全网最优价 · 轻松比价
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 搜索区域 */}
        <div className="mb-8">
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 关键词输入 */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={localKeyword}
                  onChange={(e) => setLocalKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="输入商品关键词，如：iPhone 15、MacBook、AirPods"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                />
              </div>

              {/* 平台选择 */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'jd', name: '京东', color: 'red' },
                  { id: 'taobao', name: '淘宝', color: 'orange' },
                  { id: 'pdd', name: '拼多多', color: 'yellow' },
                ].map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => togglePlatform(platform.id)}
                    className={clsx(
                      'px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2',
                      selectedPlatforms.includes(platform.id)
                        ? platform.color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/50' :
                          platform.color === 'orange' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                        : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700'
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    {platform.name}
                  </button>
                ))}
              </div>

              {/* 搜索按钮 */}
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? '采集中...' : '开始采集'}
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: '最低价格', value: `¥${priceStats.min}`, icon: TrendingUp, color: 'cyan' },
            { label: '最高价格', value: `¥${priceStats.max}`, icon: TrendingUp, color: 'red' },
            { label: '平均价格', value: `¥${priceStats.avg}`, icon: TrendingUp, color: 'purple' },
            { label: '推荐商品', value: `${priceStats.recommended}件`, icon: Crown, color: 'yellow' },
          ].map((stat, i) => (
            <div key={i} className={clsx(
              'bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-5',
              'hover:border-slate-600/50 transition-all'
            )}>
              <div className="flex items-center gap-3 mb-3">
                <div className={clsx(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  stat.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' :
                  stat.color === 'red' ? 'bg-red-500/20 text-red-400' :
                  stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-yellow-500/20 text-yellow-400'
                )}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 主内容区域 */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* 商品列表 */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
              <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-cyan-400" />
                  商品列表
                  <span className="text-slate-400 text-sm font-normal">({displayProducts.length}件)</span>
                </h2>
                <span className="text-xs text-slate-500">按价格从低到高排序</span>
              </div>

              <div className="divide-y divide-slate-700/30">
                {displayProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onCopy={() => copyUrl(product)}
                    isCopied={copiedId === product.id}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="space-y-6">
            {/* 价格分布图 */}
            <PriceChart products={displayProducts} />

            {/* TOP推荐 */}
            <TopProducts products={displayProducts.filter(p => p.isRecommended).slice(0, 5)} />
          </div>
        </div>
      </main>

      {/* 错误提示 */}
      {error && (
        <div className="fixed bottom-6 right-6 bg-red-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
          <span>{error}</span>
          <button onClick={() => useProductStore.setState({ error: null })} className="text-white/70 hover:text-white">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

// 商品卡片组件
function ProductCard({ product, onCopy, isCopied }: { product: Product; onCopy: () => void; isCopied: boolean }) {
  const platformStyle = platformColors[product.platform] || platformColors['京东'];

  return (
    <div className="p-4 hover:bg-slate-700/20 transition-colors group">
      <div className="flex gap-4">
        {/* 商品信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-2">
            <span className={clsx(
              'px-2 py-0.5 rounded text-xs font-medium',
              platformStyle.bg, platformStyle.text
            )}>
              {product.platform}
            </span>
            {product.isRecommended && (
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 flex items-center gap-1">
                <Crown className="w-3 h-3" />
                性价比之选
              </span>
            )}
          </div>

          <h3 className="font-medium text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              {product.rating}
            </span>
            <span>销量 {product.sales.toLocaleString()}</span>
          </div>
        </div>

        {/* 价格和操作 */}
        <div className="text-right flex flex-col items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-white">¥{product.price.toLocaleString()}</p>
          </div>
          <button
            onClick={onCopy}
            className={clsx(
              'mt-2 px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1',
              isCopied
                ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                : 'bg-slate-700/50 text-slate-400 border border-slate-600 hover:bg-slate-700 hover:text-white'
            )}
          >
            {isCopied ? (
              <>
                <Check className="w-3 h-3" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                复制链接
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 价格分布图表组件
function PriceChart({ products }: { products: Product[] }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // 初始化图表
    chartInstance.current = echarts.init(chartRef.current);

    // 计算价格分布
    const ranges = {
      '0-1k': 0,
      '1k-2k': 0,
      '2k-3k': 0,
      '3k-5k': 0,
      '5k-8k': 0,
      '8k+': 0,
    };

    products.forEach(p => {
      if (p.price < 1000) ranges['0-1k']++;
      else if (p.price < 2000) ranges['1k-2k']++;
      else if (p.price < 3000) ranges['2k-3k']++;
      else if (p.price < 5000) ranges['3k-5k']++;
      else if (p.price < 8000) ranges['5k-8k']++;
      else ranges['8k+']++;
    });

    const option = {
      backgroundColor: 'transparent',
      title: {
        text: '价格分布',
        left: 'left',
        textStyle: { color: '#e2e8f0', fontSize: 14, fontWeight: 600 },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        borderColor: 'rgba(100, 116, 139, 0.5)',
        textStyle: { color: '#e2e8f0' },
      },
      xAxis: {
        type: 'category',
        data: Object.keys(ranges),
        axisLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.3)' } },
        axisLabel: { color: '#94a3b8' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: 'rgba(100, 116, 139, 0.2)' } },
        axisLabel: { color: '#94a3b8' },
      },
      series: [{
        type: 'bar',
        data: Object.values(ranges),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#06b6d4' },
            { offset: 1, color: '#3b82f6' },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '60%',
      }],
      grid: { left: 40, right: 20, top: 40, bottom: 30 },
    };

    chartInstance.current.setOption(option);

    // 响应式
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [products]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4">
      <div ref={chartRef} className="w-full h-64" />
    </div>
  );
}

// TOP推荐组件
function TopProducts({ products }: { products: Product[] }) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50 flex items-center gap-2">
        <Crown className="w-5 h-5 text-yellow-400" />
        <h2 className="font-semibold">性价比TOP</h2>
      </div>

      <div className="divide-y divide-slate-700/30">
        {products.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-sm">
            暂无推荐商品
          </div>
        ) : (
          products.slice(0, 5).map((product, index) => (
            <div key={product.id} className="p-3 hover:bg-slate-700/20 transition-colors">
              <div className="flex items-center gap-3">
                <span className={clsx(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-slate-400/20 text-slate-400' :
                  index === 2 ? 'bg-orange-600/20 text-orange-400' :
                  'bg-slate-600/20 text-slate-500'
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{product.name}</p>
                  <p className="text-xs text-slate-400">{product.platform} · 销量{product.sales.toLocaleString()}</p>
                </div>
                <span className="text-lg font-bold text-cyan-400">¥{product.price.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
