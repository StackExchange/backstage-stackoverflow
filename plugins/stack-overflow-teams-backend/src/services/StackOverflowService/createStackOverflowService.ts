import { LoggerService } from '@backstage/backend-plugin-api';
import {
  PaginatedResponse,
  Question,
  SearchItem,
  StackOverflowAPI,
  StackOverflowConfig,
  QuestionFilters,
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

  // Helper function to build query parameters
  const buildParams = (filters: Record<string, any>): Record<string, string> => {
    const params: Record<string, string> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params[key] = value.toString();
      }
    });
    
    return params;
  };

  return {
    getQuestions: (authToken: string, filters?: QuestionFilters) => {
      const params = buildParams({
        sort: filters?.sort || 'creation',
        order: filters?.order || 'desc',
        isAnswered: filters?.isAnswered,
        page: filters?.page,
        pageSize: filters?.pageSize || 30,
      });
      
      return api.GET<PaginatedResponse<Question>>('/questions', authToken, teamName, params);
    },
    getTags: (authToken: string, search?: string) => {
      const params: Record<string, string> = { sort: 'postCount', order: 'desc' };
      if (search) {
        params.partialName = search;
      }
      return api.GET<PaginatedResponse<Tag>>('/tags', authToken, teamName, params);
    },
    getUsers: authToken =>
      api.GET<PaginatedResponse<User>>('/users', authToken, teamName),
    getMe: authToken => api.GET<User>('/users/me', authToken, teamName),
    
    // Convenience methods for common filtering scenarios
    getActiveQuestions: (authToken: string, page?: number) =>
      api.GET<PaginatedResponse<Question>>('/questions', authToken, teamName, 
        buildParams({ sort: 'activity', order: 'desc', page })),
    
    getNewestQuestions: (authToken: string, page?: number) =>
      api.GET<PaginatedResponse<Question>>('/questions', authToken, teamName, 
        buildParams({ sort: 'creation', order: 'desc', page })),
    
    getTopScoredQuestions: (authToken: string, page?: number) =>
      api.GET<PaginatedResponse<Question>>('/questions', authToken, teamName, 
        buildParams({ sort: 'score', order: 'desc', page })),
    
    getUnansweredQuestions: (authToken: string, page?: number) =>
      api.GET<PaginatedResponse<Question>>('/questions', authToken, teamName, 
        buildParams({ isAnswered: false, sort: 'creation', order: 'desc', page })),
  
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
    getSearch: (query: string, authToken: string, page?: number) =>
      api.SEARCH<PaginatedResponse<SearchItem>>(
        '/search',
        query,
        authToken,
        teamName,
        page,
      ),
  };
}