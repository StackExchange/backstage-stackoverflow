import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import { Navigate } from 'react-router-dom';
import { createApp } from '@backstage/frontend-defaults';
import {
  PageBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import searchPlugin from '@backstage/plugin-search/alpha';
import userSettingsPlugin from '@backstage/plugin-user-settings/alpha';
import stackOverflowTeamsPlugin from '@stackoverflow/backstage-plugin-stack-overflow-teams/alpha';
import '@backstage/ui/css/styles.css';

/**
 * Sends the app root at `/` to the catalog, matching where the legacy app in
 * `packages/app` lands.
 */
const homeRedirect = PageBlueprint.make({
  name: 'home-redirect',
  params: {
    path: '/',
    loader: async () => <Navigate to="catalog" />,
  },
});

const appModule = createFrontendModule({
  pluginId: 'app',
  extensions: [homeRedirect],
});

/**
 * A minimal app on the new Backstage frontend system, used to develop and
 * verify the `/alpha` entry point of the Stack Internal plugin.
 *
 * Features are listed explicitly rather than discovered from `app.packages`
 * config, so that this app stays a deliberate, readable example.
 */
const app = createApp({
  features: [
    catalogPlugin,
    searchPlugin,
    userSettingsPlugin,
    stackOverflowTeamsPlugin,
    appModule,
  ],
});

ReactDOM.createRoot(document.getElementById('root')!).render(app.createRoot());
