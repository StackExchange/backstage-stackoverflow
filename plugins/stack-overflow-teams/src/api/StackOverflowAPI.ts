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

export interface StackOverflowAPI {
  getQuestions(): Promise<ApiResponse<Question>>;
  getTags(): Promise<ApiResponse<Tag>>;
  getUsers(): Promise<ApiResponse<User>>;
  startAuth(): Promise<string>;
  completeAuth(code: string, state: string): Promise<void>;
}

export const createStackOverflowApi = (
  discoveryApi: DiscoveryApi,
  fetchApi: FetchApi,
): StackOverflowAPI => {
  const getBaseUrl = async () =>
    await discoveryApi.getBaseUrl('stack-overflow-teams');

  const authenticate = async (endpoint: string, params?: string[]) => {
    const queryString = params ? `?${params.join('&')}` : '';
    const url = `${await getBaseUrl()}/${endpoint}${queryString}`;
    const response = await fetchApi.fetch(url, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Authentication failed at ${endpoint}`);
    }
    return response.json();
  };

  const fetchAPI = async <T>(endpoint: string): Promise<T> => {
    const url = `${await getBaseUrl()}/${endpoint}`;
    const response = await fetchApi.fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${endpoint} (${response.status}): ${response.statusText}`,
      );
    }

    return response.json();
  };

  return {
    // Read actions, they use stackoverflow.apiAccessToken
    getQuestions: () => fetchAPI<ApiResponse<Question>>('questions'),
    getTags: () => fetchAPI<ApiResponse<Tag>>('tags'),
    getUsers: () => fetchAPI<ApiResponse<User>>('users'),

    // Authentication, to create an access token specific to the user
    startAuth: async () => {
      const data = await authenticate('auth/start');
      return data.authUrl;
    },
    completeAuth: async (code: string, state: string) => {
      await authenticate('callback', [
        `code=${encodeURIComponent(code)}`,
        `state=${encodeURIComponent(state)}`,
      ]);
    },
  };
};
