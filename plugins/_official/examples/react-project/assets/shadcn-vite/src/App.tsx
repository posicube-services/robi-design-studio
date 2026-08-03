import { Route, Routes } from 'react-router-dom';

import { DemoPage } from './pages/demo';
import { LandingPage } from './pages/landing';
import { paths } from './routes/paths';

/**
 * Route table. Add the brief's real screens here and give each one a file under
 * `src/pages/` — keep this component a map, not a place where UI accumulates.
 *
 * `/` is what the workspace preview loads, so it holds the real entry screen;
 * the seed's reference dashboard is parked at `/demo`.
 */
export function App() {
  return (
    <Routes>
      <Route path={paths.home} element={<LandingPage />} />
      <Route path={paths.demo} element={<DemoPage />} />
    </Routes>
  );
}
