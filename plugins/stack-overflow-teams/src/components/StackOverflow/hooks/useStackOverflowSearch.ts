import { useApi } from "@backstage/core-plugin-api";
import { stackoverflowteamsApiRef } from "../../../api/StackOverflowAPI";
import { useCallback, useState } from "react";
import { PaginatedResponse } from "../../../types";

interface SearchData {
  items: any[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

export const useStackOverflowSearch = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (query: string, page?: number) => {
    if (!query.trim()) {
      setSearchData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<any> = await stackOverflowTeamsApi.search(query, page);
      setSearchData({
        items: response.items,
        totalCount: response.totalCount,
        totalPages: response.totalPages,
        page: response.page,
        pageSize: response.pageSize,
      });
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setSearchData(null);
    } finally {
      setLoading(false);
    }
  }, [stackOverflowTeamsApi]);

  const clearSearch = useCallback(() => {
    setSearchData(null);
    setError(null);
  }, []);

  return { 
    searchData, 
    loading, 
    error, 
    search, 
    clearSearch,
    // Convenience getters
    hasResults: !!searchData?.items.length,
    totalPages: searchData?.totalPages || 0,
    currentPage: searchData?.page || 1,
    totalCount: searchData?.totalCount || 0,
  };
};