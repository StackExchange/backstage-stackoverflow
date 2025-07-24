import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { Question, stackoverflowteamsApiRef, Tag, User } from '../../../api/';

type PostType = 'questions' | 'tags' | 'users' 

interface QuestionFilters {
  sort?: 'activity' | 'creation' | 'score';
  order?: 'asc' | 'desc';
  isAnswered?: boolean;
  page?: number;
  pageSize?: number;
}

interface StackOverflowData {
  questions?: Question[];
  tags?: Tag[];
  users?: User[];
  totalPages?: number;
  totalCount?: number;
  currentPage?: number;
}

interface UseStackOverflowDataOptions {
  questionFilters?: QuestionFilters;
  tagSearch?: string;
}

export const useStackOverflowData = (type: PostType, options?: UseStackOverflowDataOptions) => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [data, setData] = useState<StackOverflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (type) {
        case 'questions':
          response = await stackOverflowTeamsApi.getQuestions(options?.questionFilters);
          setData({ 
            questions: response.items,
            totalPages: response.totalPages,
            totalCount: response.totalCount,
            currentPage: response.page
          });
          break;
        case 'tags':
          response = await stackOverflowTeamsApi.getTags(options?.tagSearch);
          setData({ tags: response.items });
          break;
        case 'users':
          response = await stackOverflowTeamsApi.getUsers();
          setData({ users: response.items });
          break;
        default:
          throw new Error(`Invalid data type: ${type}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [type, stackOverflowTeamsApi, options?.questionFilters, options?.tagSearch]);

  // Convenience methods for questions
  const fetchActiveQuestions = useCallback(async (page?: number) => {
    if (type !== 'questions') return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await stackOverflowTeamsApi.getActiveQuestions(page);
      setData({ 
        questions: response.items,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        currentPage: response.page
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [type, stackOverflowTeamsApi]);

  const fetchNewestQuestions = useCallback(async (page?: number) => {
    if (type !== 'questions') return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await stackOverflowTeamsApi.getNewestQuestions(page);
      setData({ 
        questions: response.items,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        currentPage: response.page
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [type, stackOverflowTeamsApi]);

  const fetchTopScoredQuestions = useCallback(async (page?: number) => {
    if (type !== 'questions') return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await stackOverflowTeamsApi.getTopScoredQuestions(page);
      setData({ 
        questions: response.items,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        currentPage: response.page
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [type, stackOverflowTeamsApi]);

  const fetchUnansweredQuestions = useCallback(async (page?: number) => {
    if (type !== 'questions') return;
    setLoading(true);
    setError(null);
    
    try {
      const response = await stackOverflowTeamsApi.getUnansweredQuestions(page);
      setData({ 
        questions: response.items,
        totalPages: response.totalPages,
        totalCount: response.totalCount,
        currentPage: response.page
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [type, stackOverflowTeamsApi]);

  return { 
    data, 
    loading, 
    error, 
    fetchData,
    // Convenience methods for questions
    fetchActiveQuestions,
    fetchNewestQuestions, 
    fetchTopScoredQuestions,
    fetchUnansweredQuestions
  };
};