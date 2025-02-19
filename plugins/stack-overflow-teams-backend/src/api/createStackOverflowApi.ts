// Comentar sobre AuthToken v AccessToken

import { LoggerService } from '@backstage/backend-plugin-api';

export const createStackOverflowApi = (baseUrl: string, logger: LoggerService) => {
  const request = async <T>(
    endpoint: string,
    method: 'GET' | 'POST',
    teamName?: string,
    body?: any,
    authToken?: string,
    apiAccessToken?: string,
  ): Promise<T> => {
    const url = teamName
      ? `${baseUrl}/teams/${teamName}${endpoint}`
      : `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    headers['Authorization'] = `Bearer ${method === 'POST' ? authToken : apiAccessToken}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      logger.error(`Failed to ${method} ${endpoint}: ${errorMessage}`);
    }

    return response.json();
  };

  return {
    GET: <T>(endpoint: string, teamName?: string, apiAccessToken?: string) =>
      request<T>(endpoint, 'GET', teamName, undefined, undefined, apiAccessToken),

    POST: <T>(endpoint: string, body: any, authToken: string, teamName?: string) =>
      request<T>(endpoint, 'POST', teamName, body, authToken),
  };
};