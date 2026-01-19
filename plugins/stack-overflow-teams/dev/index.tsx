import { createDevApp } from '@backstage/dev-utils';
import { stackOverflowTeamsPlugin, StackOverflowTeamsPage } from '../src/plugin';

createDevApp()
  .registerPlugin(stackOverflowTeamsPlugin)
  .addPage({
    element: <StackOverflowTeamsPage />,
    title: 'Root Page',
    path: '/stack-overflow-teams',
  })
  .render();
