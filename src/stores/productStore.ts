import { create } from 'zustand';

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

interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  keyword: string;
  platforms: string[];
  fetchProducts: (keyword: string, platforms: string[]) => Promise<void>;
  setKeyword: (keyword: string) => void;
  setPlatforms: (platforms: string[]) => void;
}

const API_BASE = 'http://localhost:3001';

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  keyword: '',
  platforms: ['jd', 'taobao', 'pdd'],

  setKeyword: (keyword) => set({ keyword }),
  setPlatforms: (platforms) => set({ platforms }),

  fetchProducts: async (keyword: string, platforms: string[]) => {
    if (!keyword.trim()) {
      set({ error: '请输入搜索关键词' });
      return;
    }

    set({ loading: true, error: null });

    try {
      const response = await fetch(`${API_BASE}/api/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, platforms, limit: 50 }),
      });

      const data = await response.json();

      if (data.success) {
        set({ products: data.data, loading: false });
      } else {
        set({ error: data.message || '采集失败', loading: false });
      }
    } catch (err) {
      set({ error: '网络错误，请确保后端服务已启动', loading: false });
    }
  },
}));

// 初始示例数据
export const sampleProducts: Product[] = [
  {
    id: 'jd_1001',
    name: 'iPhone 15 Pro Max 256GB 深空黑',
    price: 9999,
    sales: 25800,
    rating: 4.9,
    url: 'https://item.jd.com/100001234567.html',
    platform: '京东',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
  {
    id: 'taobao_1002',
    name: 'iPhone 15 Pro 256GB 钛金属原色',
    price: 8999,
    sales: 18600,
    rating: 4.8,
    url: 'https://item.taobao.com/item.htm?id=123456789',
    platform: '淘宝',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
  {
    id: 'pdd_1003',
    name: 'iPhone 15 标准版 128GB 蓝色',
    price: 5499,
    sales: 45600,
    rating: 4.7,
    url: 'https://mobile.yangkeduo.com/proxy.html?goods_id=987654321',
    platform: '拼多多',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
  {
    id: 'jd_1004',
    name: 'iPhone 15 Plus 256GB 午夜色',
    price: 6999,
    sales: 12400,
    rating: 4.8,
    url: 'https://item.jd.com/100001234568.html',
    platform: '京东',
    crawlTime: new Date().toISOString(),
    isRecommended: false,
  },
  {
    id: 'taobao_1005',
    name: 'iPhone 15 Pro 128GB 白色钛金属',
    price: 7999,
    sales: 32100,
    rating: 4.9,
    url: 'https://item.taobao.com/item.htm?id=123456790',
    platform: '淘宝',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
  {
    id: 'pdd_1006',
    name: 'iPhone 15 Mini 128GB 粉色',
    price: 4499,
    sales: 8900,
    rating: 4.6,
    url: 'https://mobile.yangkeduo.com/proxy.html?goods_id=987654322',
    platform: '拼多多',
    crawlTime: new Date().toISOString(),
    isRecommended: false,
  },
  {
    id: 'jd_1007',
    name: 'iPhone 14 Pro Max 256GB 灵动岛',
    price: 7999,
    sales: 45200,
    rating: 4.8,
    url: 'https://item.jd.com/100001234569.html',
    platform: '京东',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
  {
    id: 'taobao_1008',
    name: 'iPhone 14 标准版 128GB 星光色',
    price: 4699,
    sales: 67200,
    rating: 4.7,
    url: 'https://item.taobao.com/item.htm?id=123456791',
    platform: '淘宝',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
  {
    id: 'pdd_1009',
    name: 'iPhone 15 Pro Max 512GB 钛金属蓝',
    price: 11999,
    sales: 5600,
    rating: 4.9,
    url: 'https://mobile.yangkeduo.com/proxy.html?goods_id=987654323',
    platform: '拼多多',
    crawlTime: new Date().toISOString(),
    isRecommended: false,
  },
  {
    id: 'jd_1010',
    name: 'iPhone 15 SE 64GB 性价比之选',
    price: 3499,
    sales: 23400,
    rating: 4.5,
    url: 'https://item.jd.com/100001234570.html',
    platform: '京东',
    crawlTime: new Date().toISOString(),
    isRecommended: true,
  },
];
