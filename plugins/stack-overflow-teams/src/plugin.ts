import {
  createPlugin,
  createRoutableExtension,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';

export const stackOverflowTeamsPlugin = createPlugin({
  id: 'stack-overflow-teams',
  routes: {
    root: rootRouteRef,
  },
});

export const StackOverflowTeamsPage = stackOverflowTeamsPlugin.provide(
  createRoutableExtension({
    name: 'StackOverflowTeamsPage',
    component: () =>
      import('./components/Read-Only').then(m => m.StackOverflowHub),
    mountPoint: rootRouteRef,
  }),
);
