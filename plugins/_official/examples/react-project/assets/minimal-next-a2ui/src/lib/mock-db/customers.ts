/**
 * @od-component mock-db/customers
 * @notes In-memory mutable store standing in for the customers API. Both the
 *   query (`listCustomers`) and the mutation (`createCustomer`) hit THIS
 *   module, so a Form submit genuinely changes what DataTable/StatCard render
 *   next — the full read-after-write loop, minus the network. Swap the two
 *   exported functions for axios calls against a real endpoint; hooks, blocks
 *   and specs stay unchanged.
 * @posicube-minimal version=0.1.0
 */

export type CustomerStatus = 'active' | 'trialing' | 'churned' | 'suspended';

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: CustomerStatus;
  mrr: number;
  joinedAt: string;
};

const customers: Customer[] = [
  { id: 'c1', name: '김도현', email: 'dohyun.kim@northwind.io', company: 'Northwind', status: 'active', mrr: 1200, joinedAt: '2024-11-02' },
  { id: 'c2', name: '이서연', email: 'seoyeon@acme.dev', company: 'Acme', status: 'trialing', mrr: 0, joinedAt: '2026-05-18' },
  { id: 'c3', name: '박준영', email: 'junyoung.park@globex.com', company: 'Globex', status: 'active', mrr: 4800, joinedAt: '2023-07-21' },
  { id: 'c4', name: '최유진', email: 'yujin.choi@initech.co', company: 'Initech', status: 'churned', mrr: 0, joinedAt: '2022-03-11' },
  { id: 'c5', name: '정민수', email: 'minsu@umbrella.health', company: 'Umbrella', status: 'active', mrr: 2600, joinedAt: '2024-02-09' },
  { id: 'c6', name: '한지우', email: 'jiwoo.han@hooli.xyz', company: 'Hooli', status: 'suspended', mrr: 900, joinedAt: '2023-12-30' },
  { id: 'c7', name: '오세훈', email: 'sehoon@piedpiper.ai', company: 'Pied Piper', status: 'trialing', mrr: 0, joinedAt: '2026-06-10' },
  { id: 'c8', name: '윤하늘', email: 'haneul.yoon@soylent.com', company: 'Soylent', status: 'active', mrr: 3300, joinedAt: '2025-01-14' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function listCustomers(): Promise<Customer[]> {
  // Simulated network latency so the skeleton state is observable.
  await delay(700);
  return [...customers];
}

export type CreateCustomerInput = Record<string, unknown>;

const STATUSES: CustomerStatus[] = ['active', 'trialing', 'churned', 'suspended'];

/**
 * Lenient by design: the Form block submits whatever fields the SPEC declared
 * (the LLM chooses field names), so unknown fields are ignored and sensible
 * defaults fill the gaps. The Form's own zod schema already enforced
 * required/type rules before this runs.
 */
export async function createCustomer(input: CreateCustomerInput): Promise<Customer> {
  await delay(500);

  const name = typeof input.name === 'string' && input.name.trim() ? input.name.trim() : '이름 미지정';
  const rawStatus = typeof input.status === 'string' ? input.status : undefined;
  const isTrial = input.trial === true || input.isTrial === true || input.trialing === true;

  const record: Customer = {
    id: `c${Date.now().toString(36)}`,
    name,
    email: typeof input.email === 'string' ? input.email : '',
    company: typeof input.company === 'string' ? input.company : '',
    status: STATUSES.includes(rawStatus as CustomerStatus)
      ? (rawStatus as CustomerStatus)
      : isTrial
        ? 'trialing'
        : 'active',
    mrr: typeof input.mrr === 'number' && Number.isFinite(input.mrr) ? input.mrr : 0,
    joinedAt: new Date().toISOString().slice(0, 10),
  };

  customers.unshift(record);
  return record;
}

export async function deleteCustomer(input: Record<string, unknown>): Promise<{ id: string }> {
  await delay(400);
  const id = String(input.id ?? '');
  const index = customers.findIndex((customer) => customer.id === id);
  if (index >= 0) customers.splice(index, 1);
  return { id };
}
