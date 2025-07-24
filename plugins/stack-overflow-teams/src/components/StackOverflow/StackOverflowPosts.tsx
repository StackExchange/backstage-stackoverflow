import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  makeStyles,
  Theme,
  Grid,
  Paper,
  Typography,
  Button,
  ButtonGroup,
  TextField,
  InputAdornment,
  Box,
} from '@material-ui/core';
import Skeleton from '@mui/material/Skeleton';
import { Link, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowSearch } from './hooks';
import { useStackOverflowData } from './hooks';
import { StackOverflowSearchResultListItem } from './StackOverflowSearchResultListItem';
import SearchIcon from '@material-ui/icons/Search';
import { StackOverflowIcon } from '../../icons';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';

const useStyles = makeStyles((theme: Theme) => ({
  filters: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  buttonGroup: {
    flexWrap: 'wrap',
  },
  resultCount: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
  searchField: {
    borderRadius: 40,
    paddingLeft: 16,
    paddingRight: 16,
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    minHeight: '600px', // Fixed height for consistency
  },
  loadingSkeletonItem: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
  },
  skeletonContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
  },
  skeletonHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  skeletonTags: {
    display: 'flex',
    gap: theme.spacing(1),
    marginTop: theme.spacing(1),
  },
}));

type FilterType = {
  id: string;
  label: string;
};

const FILTERS: FilterType[] = [
  { id: 'unanswered', label: 'Unanswered' },
  { id: 'newest', label: 'Newest' },
  { id: 'active', label: 'Active' },
  { id: 'score', label: 'Score' },
];

const CLIENT_ITEMS_PER_PAGE = 5;
const SERVER_ITEMS_PER_PAGE = 30;
const SEARCH_ITEMS_PER_PAGE = 30;

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Loading skeleton component for consistent UI height
  
const LoadingSkeleton = () => {
  const classes = useStyles();
  
  // Generate stable, unique keys for skeleton items
  const skeletonKeys = useMemo(() => 
    Array.from({ length: CLIENT_ITEMS_PER_PAGE }, (_, index) => 
      `skeleton-${index}-${Math.random().toString(36).substr(2, 9)}`
    ), []
  );
  
  return (
    <div className={classes.loadingContainer}>
      {skeletonKeys.map(key => (
        <Paper key={key} className={classes.loadingSkeletonItem} elevation={1}>
          <div className={classes.skeletonContent}>
            <div className={classes.skeletonHeader}>
              <Skeleton variant="circular" width={32} height={32} />
              <div style={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </div>
              <Skeleton variant="rectangular" width={60} height={24} />
            </div>
            
            <Skeleton variant="text" width="90%" height={24} />
            <Skeleton variant="text" width="75%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
            
            <div className={classes.skeletonTags}>
              <Skeleton variant="rectangular" width={60} height={20} />
              <Skeleton variant="rectangular" width={80} height={20} />
              <Skeleton variant="rectangular" width={45} height={20} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <Skeleton variant="text" width={120} height={16} />
              <Skeleton variant="text" width={80} height={16} />
            </div>
          </div>
        </Paper>
      ))}
    </div>
  );
};

// Universal pagination utility functions
const calculateServerPage = (clientPage: number, serverPageSize: number = SERVER_ITEMS_PER_PAGE): number => {
  return Math.ceil((clientPage * CLIENT_ITEMS_PER_PAGE) / serverPageSize);
};

const calculateItemsRange = (clientPage: number, serverPage: number, serverPageSize: number = SERVER_ITEMS_PER_PAGE) => {
  const globalStartIndex = (clientPage - 1) * CLIENT_ITEMS_PER_PAGE;
  const serverStartIndex = (serverPage - 1) * serverPageSize;
  const localStartIndex = globalStartIndex - serverStartIndex;
  const localEndIndex = localStartIndex + CLIENT_ITEMS_PER_PAGE;
  
  return { localStartIndex, localEndIndex };
};

// Enhanced search data management
const useEnhancedSearch = () => {
  const searchHook = useStackOverflowSearch();
  const [searchCache, setSearchCache] = useState<{[key: string]: any}>({});
  const lastSearchRef = useRef<{term: string, page: number} | null>(null);

  // Get the actual page size from the search response, fallback to our constant
  const getActualSearchPageSize = useCallback(() => {
    return searchHook.searchData?.pageSize || SEARCH_ITEMS_PER_PAGE;
  }, [searchHook.searchData?.pageSize]);

  const enhancedSearch = useCallback((term: string, clientPage: number) => {
    const actualPageSize = getActualSearchPageSize();
    const serverPage = calculateServerPage(clientPage, actualPageSize);
    const cacheKey = `${term}-${serverPage}`;
    
    // Prevent duplicate requests
    const currentSearch = { term, page: serverPage };
    if (lastSearchRef.current && 
        lastSearchRef.current.term === currentSearch.term && 
        lastSearchRef.current.page === currentSearch.page) {
      return;
    }
    
    if (searchCache[cacheKey]) {
      return;
    }
    
    // Store the search reference to prevent duplicates
    lastSearchRef.current = currentSearch;
    
    // Perform the search for the required server page
    searchHook.search(term, serverPage);
  }, [getActualSearchPageSize, searchCache, searchHook]);

  // Cache search results when they arrive
  useEffect(() => {
    if (searchHook.searchData && lastSearchRef.current) {
      const serverPage = searchHook.searchData.page;
      const searchTerm = lastSearchRef.current.term;
      const cacheKey = `${searchTerm}-${serverPage}`;
      
      setSearchCache(prev => ({
        ...prev,
        [cacheKey]: {
          items: searchHook?.searchData?.items,
          totalCount: searchHook?.searchData?.totalCount,
          pageSize: searchHook?.searchData?.pageSize,
          timestamp: Date.now()
        }
      }));
    }
  }, [searchHook.searchData]);

  const getSearchDisplayData = useCallback((term: string, clientPage: number) => {
    const actualPageSize = getActualSearchPageSize();
    const serverPage = calculateServerPage(clientPage, actualPageSize);
    const cacheKey = `${term}-${serverPage}`;
    const cachedData = searchCache[cacheKey];
    
    if (!cachedData) {
      return {
        currentPageData: [],
        totalCount: 0,
        loading: searchHook.loading,
        error: searchHook.error
      };
    }
    
    const { localStartIndex, localEndIndex } = calculateItemsRange(
      clientPage, 
      serverPage, 
      cachedData.pageSize
    );
    
    const currentPageData = cachedData.items.slice(localStartIndex, localEndIndex);
    
    return {
      currentPageData,
      totalCount: cachedData.totalCount,
      loading: false,
      error: null
    };
  }, [searchCache, searchHook.loading, searchHook.error, getActualSearchPageSize]);

  const clearSearchCache = useCallback(() => {
    setSearchCache({});
    lastSearchRef.current = null;
  }, []);

  return {
    enhancedSearch,
    getSearchDisplayData,
    clearSearch: searchHook.clearSearch,
    clearSearchCache,
    loading: searchHook.loading,
    error: searchHook.error
  };
};

export const StackOverflowQuestions = () => {
  const classes = useStyles();
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [baseUrl, setBaseUrl] = useState<string>('');
  
  const { 
    data: questionsData, 
    loading: questionsLoading, 
    error: questionsError,
    fetchActiveQuestions,
    fetchNewestQuestions,
    fetchTopScoredQuestions,
    fetchUnansweredQuestions
  } = useStackOverflowData('questions');
  
  const { 
    enhancedSearch,
    getSearchDisplayData,
    clearSearch,
    clearSearchCache,
  } = useEnhancedSearch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [questionsPage, setQuestionsPage] = useState(1);
  const prevSearchModeRef = useRef(false);

  // Store stable references to search functions
  const enhancedSearchRef = useRef(enhancedSearch);
  const clearSearchRef = useRef(clearSearch);
  const clearSearchCacheRef = useRef(clearSearchCache);

  // Update refs when functions change
  useEffect(() => {
    enhancedSearchRef.current = enhancedSearch;
    clearSearchRef.current = clearSearch;
    clearSearchCacheRef.current = clearSearchCache;
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const isSearchMode = !!searchTerm.trim();

  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  // Calculate required server page for current client page (only for questions)
  const requiredServerPage = useMemo(() => {
    return calculateServerPage(questionsPage, SERVER_ITEMS_PER_PAGE);
  }, [questionsPage]);

  // Load questions when filter or required server page changes (only in non-search mode)
  useEffect(() => {
    if (!isSearchMode) {
      switch (activeFilter) {
        case 'active':
          fetchActiveQuestions(requiredServerPage);
          break;
        case 'newest':
          fetchNewestQuestions(requiredServerPage);
          break;
        case 'score':
          fetchTopScoredQuestions(requiredServerPage);
          break;
        case 'unanswered':
          fetchUnansweredQuestions(requiredServerPage);
          break;
        default:
          fetchActiveQuestions(requiredServerPage);
          break;
      }
    }
  }, [activeFilter, requiredServerPage, isSearchMode, fetchActiveQuestions, fetchNewestQuestions, fetchTopScoredQuestions, fetchUnansweredQuestions]);

  // Handle search mode transitions
  useEffect(() => {
    const wasInSearchMode = prevSearchModeRef.current;
    
    if (isSearchMode && !wasInSearchMode) {
      // Entering search mode - reset search page to 1
      setCurrentPage(1);
    } else if (!isSearchMode && wasInSearchMode) {
      // Exiting search mode - reset questions page to 1 and current page to 1
      setQuestionsPage(1);
      setCurrentPage(1);
    }
    
    prevSearchModeRef.current = isSearchMode;
  }, [isSearchMode]);

  // Reset pagination when filter changes (only in non-search mode)
  useEffect(() => {
    if (!isSearchMode) {
      setQuestionsPage(1);
      setCurrentPage(1);
    }
  }, [activeFilter, isSearchMode]);

  // Handle search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      // Only search if we're in search mode and current page is set
      if (isSearchMode) {
        enhancedSearchRef.current(debouncedSearchTerm, currentPage);
      }
    } else {
      clearSearchRef.current();
      clearSearchCacheRef.current();
    }
  }, [debouncedSearchTerm, currentPage, isSearchMode]);

  // Handle Enter key press for immediate search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      enhancedSearchRef.current(searchTerm, currentPage);
    }
  };

  // Calculate display data and pagination info
  const displayInfo = useMemo(() => {
    if (isSearchMode) {
      const searchDisplayData = getSearchDisplayData(searchTerm, currentPage);
      const totalPages = Math.ceil(searchDisplayData.totalCount / CLIENT_ITEMS_PER_PAGE);
      
      return {
        currentPageData: searchDisplayData.currentPageData,
        totalPages,
        totalCount: searchDisplayData.totalCount,
        loading: searchDisplayData.loading,
        error: searchDisplayData.error
      };
    }

    // For regular questions, slice the server data
    if (!questionsData?.questions) {
      return {
        currentPageData: [],
        totalPages: 1,
        totalCount: 0,
        loading: questionsLoading,
        error: questionsError
      };
    }

    const { localStartIndex, localEndIndex } = calculateItemsRange(
      questionsPage, 
      requiredServerPage, 
      SERVER_ITEMS_PER_PAGE
    );
    const currentPageData = questionsData.questions.slice(localStartIndex, localEndIndex);
    
    // Calculate total pages based on total items from server
    const totalServerItems = questionsData.totalCount || 0;
    const totalPages = Math.ceil(totalServerItems / CLIENT_ITEMS_PER_PAGE);

    return {
      currentPageData,
      totalPages,
      totalCount: totalServerItems,
      loading: questionsLoading,
      error: questionsError
    };
  }, [
    isSearchMode, 
    getSearchDisplayData,
    searchTerm,
    currentPage,
    questionsPage,
    questionsData?.questions,
    questionsData?.totalCount,
    requiredServerPage,
    questionsLoading,
    questionsError
  ]);

  // Unified pagination handler
  const handlePageChange = (newPage: number) => {
    if (isSearchMode) {
      setCurrentPage(newPage);
      if (searchTerm.trim()) {
        enhancedSearchRef.current(searchTerm, newPage);
      }
    } else {
      setQuestionsPage(newPage);
      setCurrentPage(newPage);
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Get the correct page number to display
  const displayPageNumber = isSearchMode ? currentPage : questionsPage;

  // Pagination component to reuse
  const PaginationControls = () => {
    // Only show pagination if we have data or are in a valid state
    if (displayInfo.totalPages <= 1 && displayInfo.totalCount === 0 && !displayInfo.loading) {
      return null;
    }

    return (
      <div className={classes.pagination}>
        <Button
          disabled={displayPageNumber <= 1}
          onClick={() => handlePageChange(displayPageNumber - 1)}
          variant="outlined"
        >
          Previous
        </Button>
        <Typography variant="body1" style={{ margin: '0 16px' }}>
          Page {displayPageNumber} of {displayInfo.totalPages || 1}
        </Typography>
        <Button
          disabled={displayPageNumber >= (displayInfo.totalPages || 1)}
          onClick={() => handlePageChange(displayPageNumber + 1)}
          variant="outlined"
        >
          Next
        </Button>
      </div>
    );
  };

  // Show error state
  if (displayInfo.error) return <ResponseErrorPanel error={displayInfo.error} />;

  return (
    <div>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            className: classes.searchField,
          }}
        />
      </Box>

      <PaginationControls />

      {/* Only show filters when not in search mode */}
      {!isSearchMode && (
        <Paper className={classes.filters}>
          <ButtonGroup className={classes.buttonGroup}>
            {FILTERS.map(({ id, label }) => (
              <Button
                key={id}
                variant={activeFilter === id ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => toggleFilter(id)}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </Paper>
      )}

      <Typography className={classes.resultCount}>
        {isSearchMode 
          ? `Search results: ${displayInfo.totalCount} total found` 
          : `Showing ${displayInfo.currentPageData.length} of ${displayInfo.totalCount} results`}
      </Typography>

      {displayInfo.loading && <LoadingSkeleton />}

      {!displayInfo.loading && (
        <>
          {/* No results */}
          {displayInfo.currentPageData.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" gutterBottom>
                {searchTerm.trim()
                  ? `No questions found matching "${searchTerm}"`
                  : "No questions found"
                }
              </Typography>
              {searchTerm.trim() && (
                <Link
                  to={`${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`}
                >
                  However, you might find more questions on your Stack Overflow Team.
                </Link>
              )}
            </Box>
          )}

          {/* Results */}
          {displayInfo.currentPageData.length > 0 && (
            <>
              <Grid container spacing={2}>
                {displayInfo.currentPageData.map((question: any) => (
                  <Grid item xs={12} key={question.id}>
                    <StackOverflowSearchResultListItem
                      result={{
                        location: question.webUrl,
                        title: question.title,
                        text: question.owner?.name,
                        answers: question.answerCount,
                        tags: question.tags,
                        created: question.creationDate,
                        author: question.owner?.name,
                        score: question.score,
                        isAnswered: question.isAnswered,
                        creationDate: question.creationDate,
                        userRole: question.owner?.role,
                        userProfile: question.owner?.webUrl,
                        avatar: question.owner?.avatarUrl,
                        userReputation: question.owner?.reputation,
                      }}
                      icon={<StackOverflowIcon />}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box mt={2}>
                <Link to={searchTerm.trim()
                  ? `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}` 
                  : `${baseUrl}/questions`}
                >
                  <Typography variant='body1'>
                    Explore more questions on your Stack Overflow Team
                  </Typography>
                </Link>
              </Box>
            </>
          )}
        </>
      )}

      <PaginationControls />
    </div>
  );
};