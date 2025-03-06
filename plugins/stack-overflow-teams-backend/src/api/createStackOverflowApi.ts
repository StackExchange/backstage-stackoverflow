export const createStackOverflowApi = (
  baseUrl: string,
) => {
  const request = async <T>(
    endpoint: string,
    method: 'GET' | 'POST',
    teamName?: string,
    body?: any,
    authToken?: string,
    apiAccessToken?: string,
    searchQuery?: string,
    pageSize?: number,
  ): Promise<T> => {
    let url = teamName
      ? `${baseUrl}/teams/${teamName}${endpoint}`
      : `${baseUrl}${endpoint}`;

    const queryParams = new URLSearchParams();

    if (searchQuery) {
      const queryParamsfromSearchQuery = new URLSearchParams(searchQuery);
      queryParamsfromSearchQuery.forEach((value, key) => {
        queryParams.append(key, value);
      });
    }

    if (pageSize) {
      queryParams.append('pageSize', pageSize.toString());
    }

    url += `?${queryParams.toString()}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${method === 'POST' ? authToken : apiAccessToken}`,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseData = await response.json();

    if (!response.ok) {
      const error = new Error (`API Request failed: ${response.statusText}`);
      (error as any).status = response.status;
      (error as any).responseData = responseData;
      throw error
    }
    return responseData
  };

  return {
    GET: <T>(endpoint: string, teamName?: string, apiAccessToken?: string) =>
      request<T>(
        endpoint,
        'GET',
        teamName,
        undefined,
        undefined,
        apiAccessToken,
      ),

    POST: <T>(
      endpoint: string,
      body: any,
      authToken: string,
      teamName?: string,
    ) => request<T>(endpoint, 'POST', teamName, body, authToken),

    SEARCH: <T>(
      endpoint: string,
      searchQuery: string,
      authToken: string,
      teamName?: string,
    ) =>
      request<T>(
        endpoint,
        'GET',
        teamName,
        undefined,
        authToken,
        undefined,
        searchQuery,
        30,
      ),
  };
};
