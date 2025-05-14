import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createStackOverflowService } from './services/StackOverflowService';
import { StackOverflowConfig } from './services/StackOverflowService';

/**
 * stackOverflowTeamsPlugin backend plugin
 *
 * @public
 */

export const stackOverflowTeamsPlugin = createBackendPlugin({
  pluginId: 'stack-overflow-teams',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
        httpRouter: coreServices.httpRouter,
        config: coreServices.rootConfig,
      },
      async init({ logger, httpRouter, config }) {
        const forceOriginUrl = (baseUrl: string): string =>
          `${new URL(baseUrl).origin}`;

        const teamName = config.getOptionalString('stackoverflow.teamName');

        // If teamName is provided, always use api.stackoverflowteams.com
        const baseUrl = teamName
          ? 'https://api.stackoverflowteams.com'
          : forceOriginUrl(
              config.getOptionalString('stackoverflow.baseUrl') ||
                'https://api.stackoverflowteams.com',
            );

        const stackOverflowConfig: StackOverflowConfig = {
          baseUrl,
          teamName,
          clientId: config.getOptionalNumber('stackoverflow.clientId'),
          redirectUri:
            config.getOptionalString('stackoverflow.redirectUri') ||
            `${config.getString('app.baseUrl')}/stack-overflow-teams`,
        };

        const stackOverflowService = await createStackOverflowService({
          config: stackOverflowConfig,
          logger,
        });

        httpRouter.use(
          await createRouter({
            stackOverflowConfig,
            logger,
            stackOverflowService,
          }),
        );
      },
    });
  },
});
