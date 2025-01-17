import { LoggerService } from '@backstage/backend-plugin-api/index';
import {
  PaginatedResponse,
  Question,
  StackOverflowAPI,
  StackOverflowConfig,
  Tag,
  User,
} from './types';

export async function createStackOverflowService({
  config,
  logger,
}: {
  config: StackOverflowConfig;
  logger: LoggerService;
}): Promise<StackOverflowAPI> {
  logger.info('Initializing Stack Overflow Service');

  const { baseUrl, apiAccessToken, teamName } = config;

  // Fetch data helper function

  const fetchFromApi = async <T>(
    endpoint: string,
  ): Promise<PaginatedResponse<T>> => {
    let url: string;
    if (teamName) {
      url = `${baseUrl}/teams/${teamName}${endpoint}`;
    }
    url = `${baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      logger.error('Failed to fetch data from Stack Overflow API');
      // API V3 has meaningful errors, but will double check later on this
      throw new Error(await response.text());
    }
    const data = await response.json();
    return data;
  };

  return {
    async getQuestions(): Promise<PaginatedResponse<Question>> {
      return fetchFromApi<Question>('/questions');
    },

    async getTags(): Promise<PaginatedResponse<Tag>> {
      return fetchFromApi<Tag>('/tags');
    },

    async getUsers(): Promise<PaginatedResponse<User>> {
      return fetchFromApi<User>('/users');
    },
  };
}
