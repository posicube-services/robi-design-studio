import { useQuery } from '@tanstack/react-query';

/**
 * @od-component useMonthlyRevenue
 * @notes Time-series mock for the Chart block (월별 매출/주문 추이). Returns
 *   one row per month so a Chart can bind categories=month, series=revenue/orders.
 *   Same rule: the LLM binds by name only.
 * @posicube-minimal version=0.1.0
 */
export type MonthlyPoint = {
  month: string;
  revenue: number;
  orders: number;
};

const MOCK_MONTHLY: MonthlyPoint[] = [
  { month: '1월', revenue: 8200, orders: 34 },
  { month: '2월', revenue: 9100, orders: 39 },
  { month: '3월', revenue: 7800, orders: 31 },
  { month: '4월', revenue: 11200, orders: 47 },
  { month: '5월', revenue: 10400, orders: 44 },
  { month: '6월', revenue: 13500, orders: 58 },
  { month: '7월', revenue: 12800, orders: 55 },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchMonthlyRevenue(): Promise<MonthlyPoint[]> {
  await delay(500);
  return MOCK_MONTHLY;
}

export function useMonthlyRevenue() {
  return useQuery<MonthlyPoint[]>({
    queryKey: ['monthly-revenue', 'list'],
    queryFn: fetchMonthlyRevenue,
  });
}
