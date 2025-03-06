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

  const { baseUrl, teamName } = config;
  const stackOverflowApi = createStackOverflowApi(baseUrl);

  return {
    // GET
    getQuestions: (authToken) => stackOverflowApi.GET<PaginatedResponse<Question>>('/questions', authToken, teamName),
    getTags: (authToken) => stackOverflowApi.GET<PaginatedResponse<Tag>>('/tags', authToken, teamName),
    getUsers: (authToken) => stackOverflowApi.GET<PaginatedResponse<User>>('/users', authToken, teamName),
    getMe: (authToken) => stackOverflowApi.GET<User>('/users/me', authToken, teamName),
    // POST
    postQuestions: (title: string, body: string, tags: string[], authToken: string) =>
      stackOverflowApi.POST<Question>('/questions', { title, body, tags }, authToken, teamName),
    // SEARCH
    getSearch: (query: string, authToken: string) => stackOverflowApi.SEARCH<PaginatedResponse<SearchItem>>('/search', query, authToken, teamName)
  };
}