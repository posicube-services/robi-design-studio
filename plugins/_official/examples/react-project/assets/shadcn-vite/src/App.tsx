import { Route, Routes } from 'react-router-dom';

import { DashboardPage } from './pages/dashboard';
import { paths } from './routes/paths';

/**
 * Route table. Add the brief's real screens here and give each one a file under
 * `src/pages/` — keep this component a map, not a place where UI accumulates.
 */
export function App() {
  return (
    <Routes>
      <Route path={paths.dashboard} element={<DashboardPage />} />
    </Routes>
  );
}
