export const createStackOverflowApi = (baseUrl: string) => {
  const request = async <T>(
    endpoint: string,
    method: 'GET' | 'POST',
    authToken: string,
    teamName?: string,
    body?: any,
    searchQuery?: string,
    pageSize?: number
  ): Promise<T> => {
    let url = teamName
      ? `${baseUrl}/teams/${teamName}${endpoint}`
      : `${baseUrl}${endpoint}`;

    const queryParams = new URLSearchParams();

    if (searchQuery) {
      queryParams.append('query', searchQuery);
    }

    if (pageSize) {
      queryParams.append('pageSize', pageSize.toString());
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error(`API Request failed: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).responseData = responseData;
      throw error;
    }
    return responseData;
  };

  return {
    GET: <T>(endpoint: string, authToken: string, teamName?: string) =>
      request<T>(endpoint, 'GET', authToken, teamName),

    POST: <T>(endpoint: string, body: any, authToken: string, teamName?: string) =>
      request<T>(endpoint, 'POST', authToken, teamName, body),

    SEARCH: <T>(endpoint: string, searchQuery: string, authToken: string, teamName?: string) =>
      request<T>(endpoint, 'GET', authToken, teamName, undefined, searchQuery, 30),
  };
};
