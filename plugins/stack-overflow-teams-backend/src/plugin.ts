import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { createStackOverflowService } from './services/StackOverflowService';

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
        config: coreServices.rootConfig
      },
      // Pending fixing typescript errors
      async init({ logger, httpRouter, config }) {
        const stackOverflowService = await createStackOverflowService({
          config,
          logger
        });
        // Remove unauthenticated access
        httpRouter.addAuthPolicy({
          path: '/tags',
          allow: 'unauthenticated',
        });
        
        httpRouter.addAuthPolicy({
          path: '/questions',
          allow: 'unauthenticated',
        });
        
        httpRouter.addAuthPolicy({
          path: '/users',
          allow: 'unauthenticated',
        });
        
        httpRouter.use(
          await createRouter({
            config,
            logger,
            stackOverflowService
          }),
        );
      },
    });
  },
});
