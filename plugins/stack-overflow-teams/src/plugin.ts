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
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
