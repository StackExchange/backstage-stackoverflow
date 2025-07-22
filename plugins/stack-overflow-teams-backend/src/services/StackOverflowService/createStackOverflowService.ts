import { LoggerService } from '@backstage/backend-plugin-api';
import {
  PaginatedResponse,
  Question,
  SearchItem,
  StackOverflowAPI,
  StackOverflowConfig,
  Tag,
  User,
} from './types';
import { createStackOverflowApi } from '../../api';

export async function createStackOverflowService({
  config,
  logger,
}: {
  config: StackOverflowConfig;
  logger: LoggerService;
}): Promise<StackOverflowAPI> {
  // LOGGER

  logger.info('Initializing Stack Overflow Service');

  if (config.baseUrl && config.teamName) {
    logger.warn(
      "Please note that this integration is not compatible with Enterprise Private Teams. When stackoverflow.teamName is provided the baseUrl will always change to 'api.stackoverflowteams.com'",
    );
  }

  const { baseUrl, teamName } = config;
  const api = createStackOverflowApi(
    baseUrl || 'https://api.stackoverflowteams.com',
  );

  return {
    // GET
    getQuestions: authToken =>
      api.GET<PaginatedResponse<Question>>('/questions', authToken, teamName, { sort: 'creation', order: 'desc' }),
    getTags: (authToken, search?: string) => {
      const params: Record<string, string> = { sort: 'postCount', order: 'desc' };
      if (search) {
        params.partialName = search;
      }
      return api.GET<PaginatedResponse<Tag>>('/tags', authToken, teamName, params);
    },
    getUsers: authToken =>
      api.GET<PaginatedResponse<User>>('/users', authToken, teamName),
    getMe: authToken => api.GET<User>('/users/me', authToken, teamName),
    // POST
    postQuestions: (
      title: string,
      body: string,
      tags: string[],
      authToken: string,
    ) =>
      api.POST<Question>(
        '/questions',
        { title, body, tags },
        authToken,
        teamName,
      ),
    // SEARCH
    getSearch: (query: string, authToken: string) =>
      api.SEARCH<PaginatedResponse<SearchItem>>(
        '/search',
        query,
        authToken,
        teamName,
      ),
  };
}