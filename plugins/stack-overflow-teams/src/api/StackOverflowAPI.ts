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
}

export interface StackOverflowAPI {
  search(query: string): Promise<any>;
  getQuestions(): Promise<ApiResponse<Question>>;
  getTags(): Promise<ApiResponse<Tag>>;
  getUsers(): Promise<ApiResponse<User>>;
  getMe(): Promise<User>;
  getBaseUrl(): Promise<string>;
  postQuestion(title: string, body: string, tags: string[]): Promise<Question>;
  startAuth(): Promise<string>;
  completeAuth(code: string, state: string): Promise<void>;
  getAuthStatus: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  submitAccessToken: (token: string) => Promise<boolean>;
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

  return {
    search: (query: string) => requestAPI<any>('search', 'POST', { query }),
    getQuestions: () => requestAPI<ApiResponse<Question>>('questions'),
    getTags: () => requestAPI<ApiResponse<Tag>>('tags'),
    getUsers: () => requestAPI<ApiResponse<User>>('users'),
    getMe: () => requestAPI<User>('me'),
    getBaseUrl: async () => {
      const response = await requestAPI<BaseUrlResponse>('baseurl');
      return response.SOInstance;
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
  };
};