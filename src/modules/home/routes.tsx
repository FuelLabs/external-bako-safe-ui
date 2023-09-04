import { Route } from 'react-router-dom';

import { DefaultLayoutRouter } from '@/layouts';
import { AuthRoute, Pages } from '@/modules/core';

import { HomePage } from './pages';

const homeRoutes = (
  <Route path={Pages.home()} element={<DefaultLayoutRouter />}>
    <Route
      index
      element={
        <AuthRoute>
          <HomePage />
        </AuthRoute>
      }
    />
  </Route>
);

export { homeRoutes };
