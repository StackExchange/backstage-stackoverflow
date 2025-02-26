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
  logger.info('Initializing Stack Overflow Service');

  const { baseUrl, apiAccessToken, teamName } = config;
  const stackOverflowApi = createStackOverflowApi(baseUrl, logger);

  return {
    // GET
    getQuestions: () => stackOverflowApi.GET<PaginatedResponse<Question>>('/questions', teamName, apiAccessToken),
    getTags: () => stackOverflowApi.GET<PaginatedResponse<Tag>>('/tags', teamName, apiAccessToken),
    getUsers: () => stackOverflowApi.GET<PaginatedResponse<User>>('/users', teamName, apiAccessToken),
    getMe: (authToken) => stackOverflowApi.GET<User>('/users/me', teamName, authToken),
    // POST
    postQuestions: (title: string, body: string, tags: string[], authToken: string) =>
      stackOverflowApi.POST<Question>('/questions', { title, body, tags }, authToken, teamName),
    // SEARCH
    getSearch: (query: string, authToken: string) => stackOverflowApi.SEARCH<PaginatedResponse<SearchItem>>('/search', query, authToken, teamName)
  };
}