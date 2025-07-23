import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';
import { Question, Tag, User, PaginatedResponse } from '../api';

export const stackoverflowteamsApiRef = createApiRef<StackOverflowAPI>({
  id: 'plugin.stackoverflowteams.api',
});

type ApiResponse<T> = PaginatedResponse<T>;

interface BaseUrlResponse {
  SOInstance: string;
  teamName: string
}

// Enhanced interface for questions filter options
interface QuestionsFilter {
  sort?: 'activity' | 'creation' | 'score';
  order?: 'asc' | 'desc';
  isAnswered?: boolean;
  page?: number;
  pageSize?: number;
}

export interface StackOverflowAPI {
  search(query: string, page?: number): Promise<any>;
  getQuestions(filter?: QuestionsFilter): Promise<ApiResponse<Question>>;
  getTags(search?: string): Promise<ApiResponse<Tag>>;
  getUsers(): Promise<ApiResponse<User>>;
  getMe(): Promise<User>;
  getBaseUrl(): Promise<string>;
  getTeamName(): Promise<string>;
  postQuestion(title: string, body: string, tags: string[]): Promise<Question>;
  startAuth(): Promise<string>;
  completeAuth(code: string, state: string): Promise<void>;
  getAuthStatus: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  submitAccessToken: (token: string) => Promise<boolean>;
  
  // Convenience methods for common filtering scenarios
  getActiveQuestions(page?: number): Promise<ApiResponse<Question>>;
  getNewestQuestions(page?: number): Promise<ApiResponse<Question>>;
  getTopScoredQuestions(page?: number): Promise<ApiResponse<Question>>;
  getUnansweredQuestions(page?: number): Promise<ApiResponse<Question>>;
}

export const createStackOverflowApi = (
  discoveryApi: DiscoveryApi,
  fetchApi: FetchApi,
): StackOverflowAPI => {
  const getBaseUrl = async () => discoveryApi.getBaseUrl('stack-overflow-teams');

  const requestAPI = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, unknown>,
    params?: string[],
  ): Promise<T> => {
    const baseUrl = await getBaseUrl();
    const queryString = params ? `?${params.join('&')}` : '';
    const url = `${baseUrl}/${endpoint}${queryString}`;
    
    const response = await fetchApi.fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
  };

  const buildQuestionParams = (filter?: QuestionsFilter): string[] => {
    const params: string[] = [];
    
    if (filter?.sort) {
      params.push(`sort=${filter.sort}`);
    }
    
    if (filter?.order) {
      params.push(`order=${filter.order}`);
    }
    
    if (filter?.isAnswered !== undefined) {
      params.push(`isAnswered=${filter.isAnswered}`);
    }
    
    if (filter?.page !== undefined) {
      params.push(`page=${filter.page}`);
    }
    
    if (filter?.pageSize !== undefined) {
      params.push(`pageSize=${filter.pageSize}`);
    }
    
    return params;
  };

  return {
    search: (query: string, page?: number) => {
      const body: { query: string; page?: number } = { query };
      if (page !== undefined) {
        body.page = page;
      }
      return requestAPI<any>('search', 'POST', body);
    },
    getQuestions: (filter?: QuestionsFilter) => {
      const params = buildQuestionParams(filter);
      return requestAPI<ApiResponse<Question>>('questions', 'GET', undefined, params.length > 0 ? params : undefined);
    },
    getTags: (search?: string) => {
      const params = search ? [`search=${encodeURIComponent(search)}`] : undefined;
      return requestAPI<ApiResponse<Tag>>('tags', 'GET', undefined, params);
    },
    getUsers: () => requestAPI<ApiResponse<User>>('users'),
    getMe: () => requestAPI<User>('me'),
    getBaseUrl: async () => {
      const response = await requestAPI<BaseUrlResponse>('baseurl');
      return response.SOInstance;
    },
    getTeamName: async () => {
      const response = await requestAPI<BaseUrlResponse>('baseurl')
      return response.teamName
    },
    postQuestion: (title: string, body: string, tags: string[]) =>
      requestAPI<Question>('questions', 'POST', { title, body, tags }),
    startAuth: async () => {
      const data = await requestAPI<{ authUrl: string }>('auth/start');
      return data.authUrl;
    },
    completeAuth: async (code: string, state: string) => {
      await requestAPI('callback', 'GET', undefined, [
        `code=${encodeURIComponent(code)}`,
        `state=${encodeURIComponent(state)}`,
      ]);
    },
    getAuthStatus: async (): Promise<boolean> => {
      try {
        await requestAPI('authStatus');
        return true;
      } catch {
        return false;
      }
    },
    logout: async (): Promise<boolean> => {
      try {
        await requestAPI('logout', 'POST');
        return true;
      } catch {
        return false;
      }
    },
    submitAccessToken: async (token: string): Promise<boolean> => {
      try {
        await requestAPI('auth/token', 'POST', { accessToken: token });
        return true;
      } catch {
        return false;
      }
    },

    // Convenience methods for common filtering scenarios
    getActiveQuestions: (page?: number) => {
      const params = buildQuestionParams({ sort: 'activity', order: 'desc', page });
      return requestAPI<ApiResponse<Question>>('questions', 'GET', undefined, params);
    },

    getNewestQuestions: (page?: number) => {
      const params = buildQuestionParams({ sort: 'creation', order: 'desc', page });
      return requestAPI<ApiResponse<Question>>('questions', 'GET', undefined, params);
    },

    getTopScoredQuestions: (page?: number) => {
      const params = buildQuestionParams({ sort: 'score', order: 'desc', page });
      return requestAPI<ApiResponse<Question>>('questions', 'GET', undefined, params);
    },

    getUnansweredQuestions: (page?: number) => {
      const params = buildQuestionParams({ isAnswered: false, sort: 'creation', order: 'desc', page });
      return requestAPI<ApiResponse<Question>>('questions', 'GET', undefined, params);
    },
  };
};