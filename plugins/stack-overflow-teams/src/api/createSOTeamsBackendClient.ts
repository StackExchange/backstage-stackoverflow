import { StackOverflowAPI, Question, Tag, User, PaginatedResponse } from '../api/index';
import { DiscoveryApi, FetchApi } from '@backstage/core-plugin-api';

type ApiResponse<T> = PaginatedResponse<T>;

export const createSOTeamsBackendClient = async (
  discoveryApi: DiscoveryApi,
  fetchApi: FetchApi
): Promise<StackOverflowAPI> => {
  const baseUrl = await discoveryApi.getBaseUrl('stack-overflow-teams');
  
  const createEndpoint = (path: string) => `${baseUrl}/${path}`;
  
  const fetchAPI = async <T>(url: string): Promise<T> => {
    const response = await fetchApi.fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch (${response.status}): ${response.statusText}`);
    }
    return response.json();
  };

  return {
    getQuestions: () => fetchAPI<ApiResponse<Question>>(createEndpoint('questions')),
    getTags: () => fetchAPI<ApiResponse<Tag>>(createEndpoint('tags')),
    getUsers: () => fetchAPI<ApiResponse<User>>(createEndpoint('users')),
  };
};