import { useQuery } from '@tanstack/react-query';

/**
 * @od-component useProducts
 * @notes Product catalog mock — added for the rich DataTable (entity cell with
 *   avatar, stock progress cell, publish status chip: the minimals.cc product
 *   list shape). Same rule as every hook: the LLM binds by name only.
 * @posicube-minimal version=0.1.0
 */
export type ProductStatus = 'published' | 'draft';

export type Product = {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  stock: number; // 0–100 (% of capacity)
  price: number;
  status: ProductStatus;
};

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Urban Explorer Sneakers', category: 'Accessories', createdAt: '2026-07-12', stock: 0, price: 83.74, status: 'draft' },
  { id: 'p2', name: 'Classic Leather Loafers', category: 'Shoes', createdAt: '2026-07-11', stock: 72, price: 97.14, status: 'published' },
  { id: 'p3', name: 'Mountain Trekking Boots', category: 'Apparel', createdAt: '2026-07-10', stock: 10, price: 68.71, status: 'published' },
  { id: 'p4', name: 'Elegance Stiletto Heels', category: 'Shoes', createdAt: '2026-07-09', stock: 72, price: 85.21, status: 'draft' },
  { id: 'p5', name: 'Comfy Running Shoes', category: 'Apparel', createdAt: '2026-07-08', stock: 8, price: 52.17, status: 'published' },
  { id: 'p6', name: 'Vintage Denim Jacket', category: 'Apparel', createdAt: '2026-07-07', stock: 55, price: 120.5, status: 'published' },
  { id: 'p7', name: 'Minimal Canvas Tote', category: 'Accessories', createdAt: '2026-07-06', stock: 34, price: 24.9, status: 'published' },
  { id: 'p8', name: 'Aviator Sunglasses', category: 'Accessories', createdAt: '2026-07-05', stock: 0, price: 45.0, status: 'draft' },
  { id: 'p9', name: 'Wool Blend Overcoat', category: 'Apparel', createdAt: '2026-07-04', stock: 91, price: 210.0, status: 'published' },
  { id: 'p10', name: 'Trail Running Cap', category: 'Accessories', createdAt: '2026-07-03', stock: 18, price: 19.99, status: 'published' },
  { id: 'p11', name: 'Suede Chelsea Boots', category: 'Shoes', createdAt: '2026-07-02', stock: 47, price: 132.4, status: 'published' },
  { id: 'p12', name: 'Everyday Slip-ons', category: 'Shoes', createdAt: '2026-07-01', stock: 63, price: 39.5, status: 'draft' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchProducts(): Promise<Product[]> {
  await delay(600);
  return MOCK_PRODUCTS;
}

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products', 'list'],
    queryFn: fetchProducts,
  });
}
