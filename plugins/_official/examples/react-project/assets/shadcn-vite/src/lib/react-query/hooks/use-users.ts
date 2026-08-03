import { useQuery } from '@tanstack/react-query';

/**
 * @od-component useUsers
 * @notes Second mock data hook. Its existence (plus a catalog entry) is all the
 *   authoring pipeline needs to bind a generated screen to user data — no block
 *   changes required. Proves a new spec can reach new data through the same
 *   registry. Pattern matches the starter's `posicube-react-query` rule.
 * @posicube-minimal version=0.1.0
 */
export type UserRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';
export type UserStatus = 'active' | 'invited' | 'disabled';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActiveAt: string;
};

const MOCK_USERS: User[] = [
  { id: 'u1', name: '서지훈', email: 'jihoon.seo@posicube.com', role: 'Owner', status: 'active', lastActiveAt: '2026-06-29' },
  { id: 'u2', name: '문가영', email: 'gayoung.moon@posicube.com', role: 'Admin', status: 'active', lastActiveAt: '2026-06-28' },
  { id: 'u3', name: '배준호', email: 'junho.bae@posicube.com', role: 'Member', status: 'invited', lastActiveAt: '—' },
  { id: 'u4', name: '신유라', email: 'yura.shin@posicube.com', role: 'Member', status: 'active', lastActiveAt: '2026-06-27' },
  { id: 'u5', name: '조태경', email: 'taekyung.cho@posicube.com', role: 'Viewer', status: 'disabled', lastActiveAt: '2026-04-02' },
  { id: 'u6', name: '권나윤', email: 'nayoon.kwon@posicube.com', role: 'Admin', status: 'active', lastActiveAt: '2026-06-29' },
  { id: 'u7', name: '임도윤', email: 'doyun.lim@posicube.com', role: 'Viewer', status: 'invited', lastActiveAt: '—' },
];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchUsers(): Promise<User[]> {
  await delay(600);
  return MOCK_USERS;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users', 'list'],
    queryFn: fetchUsers,
  });
}
