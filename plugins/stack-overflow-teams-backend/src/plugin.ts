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
        // Stack Overflow for Teams has different API versions, this plugin is only intended to work with /api/v3
        const forceAPIv3 = (baseUrl: string) : string => `${new URL(baseUrl).origin}/api/v3`
        const stackOverflowConfig: StackOverflowConfig = {
          baseUrl: forceAPIv3(config.getString('stackoverflow.baseUrl')),
          apiAccessToken: config.getString('stackoverflow.apiAccessToken'),
          teamName: config.getOptionalString('stackoverflow.teamName'),
          clientId: config.getOptionalNumber('stackoverflow.clientId'),
          redirectUri: config.getOptionalString('stackoverflow.redirectUri'),
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
