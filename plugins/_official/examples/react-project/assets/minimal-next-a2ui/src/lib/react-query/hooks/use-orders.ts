'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * @od-component useOrders
 * @notes Third mock data hook. Added (with a catalog entry) BEFORE asking the
 *   LLM to author an orders screen — the realistic workflow: an engineer adds
 *   the vetted data hook, then the LLM composes a screen that binds to it. The
 *   LLM cannot invent a hook (the gate rejects unknown hook names).
 * @posicube-minimal version=0.1.0
 */
export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export type Order = {
  id: string;
  orderNo: string;
  customer: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
};

const MOCK_ORDERS: Order[] = [
  { id: 'o1', orderNo: 'ORD-24817', customer: 'Northwind', amount: 1200, status: 'paid', createdAt: '2026-06-28' },
  { id: 'o2', orderNo: 'ORD-24816', customer: 'Acme', amount: 0, status: 'pending', createdAt: '2026-06-28' },
  { id: 'o3', orderNo: 'ORD-24815', customer: 'Globex', amount: 4800, status: 'paid', createdAt: '2026-06-27' },
  { id: 'o4', orderNo: 'ORD-24814', customer: 'Initech', amount: 2600, status: 'refunded', createdAt: '2026-06-26' },
  { id: 'o5', orderNo: 'ORD-24813', customer: 'Umbrella', amount: 900, status: 'failed', createdAt: '2026-06-26' },
  { id: 'o6', orderNo: 'ORD-24812', customer: 'Hooli', amount: 3300, status: 'paid', createdAt: '2026-06-25' },
  { id: 'o7', orderNo: 'ORD-24811', customer: 'Soylent', amount: 1500, status: 'pending', createdAt: '2026-06-25' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchOrders(): Promise<Order[]> {
  await delay(600);
  return MOCK_ORDERS;
}

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders', 'list'],
    queryFn: fetchOrders,
  });
}
