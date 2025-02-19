import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { Question, stackoverflowteamsApiRef, Tag, User } from '../../../api/';

interface StackOverflowData {
  questions: Question[];
  tags: Tag[];
  users: User[];
}

export const useStackOverflowData = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [data, setData] = useState<StackOverflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsResponse = await stackOverflowTeamsApi.getQuestions();
        const tagsResponse = await stackOverflowTeamsApi.getTags();
        const usersResponse = await stackOverflowTeamsApi.getUsers();

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
  }, [stackOverflowTeamsApi]);

  return { data, loading, error };
};
