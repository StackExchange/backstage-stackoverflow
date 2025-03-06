import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { Question, stackoverflowteamsApiRef, Tag, User } from '../../../api/';

type PostType = 'questions' | 'tags' | 'users' 

interface StackOverflowData {
  questions?: Question[];
  tags?: Tag[];
  users?: User[];
}

export const useStackOverflowData = (type: PostType) => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [data, setData] = useState<StackOverflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        switch (type) {
          case 'questions':
            response = await stackOverflowTeamsApi.getQuestions();
            setData({ questions: response.items });
            break;
          case 'tags':
            response = await stackOverflowTeamsApi.getTags();
            setData({ tags: response.items });
            break;
          case 'users':
            response = await stackOverflowTeamsApi.getUsers();
            setData({ users: response.items });
            break;
          default:
            throw new Error(`Invalid data type: ${type}`);
        }
        setLoading(false);
      } catch (e) {
        setError(error instanceof Error ? error : new Error(String(error)));
        setLoading(false);
      }
    };

    fetchData();
  }, [type, stackOverflowTeamsApi, error]);

  return { data, loading, error };
};
