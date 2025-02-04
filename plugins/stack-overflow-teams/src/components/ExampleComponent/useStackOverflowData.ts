import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api'; // Hook to access the API
import { discoveryApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { Question, Tag, User } from '../../api/index';
import { createSOTeamsBackendClient } from '../../api/createSOTeamsBackendClient';

interface StackOverflowData {
  questions: Question[];
  tags: Tag[];
  users: User[];
}

export const useStackOverflowData = () => {
  const discoveryApi = useApi(discoveryApiRef); 
  const fetchApi = useApi(fetchApiRef); 
  const [data, setData] = useState<StackOverflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiClient = await createSOTeamsBackendClient(discoveryApi, fetchApi);
        
        const questionsResponse = await apiClient.getQuestions();
        const tagsResponse = await apiClient.getTags();
        const usersResponse = await apiClient.getUsers();

        setData({
          questions: questionsResponse.items,
          tags: tagsResponse.items,
          users: usersResponse.items,
        });
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    };

    fetchData();
  }, [discoveryApi, fetchApi]);

  return { data, loading, error };
}