import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { createStackOverflowApi, stackoverflowteamsApiRef } from './api';

export const stackOverflowTeamsPlugin = createPlugin({
  id: 'stack-overflow-teams',
  apis: [
    createApiFactory({
      api: stackoverflowteamsApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) => createStackOverflowApi(discoveryApi, fetchApi)
    })
  ],
  routes: {
    root: rootRouteRef,
  },
});

export const StackOverflowTeamsPage = stackOverflowTeamsPlugin.provide(
  createRoutableExtension({
    name: 'StackOverflowTeamsPage',
    component: () =>
      import('./pages/').then(m => m.StackOverflowHub),
    mountPoint: rootRouteRef,
  }),
);
