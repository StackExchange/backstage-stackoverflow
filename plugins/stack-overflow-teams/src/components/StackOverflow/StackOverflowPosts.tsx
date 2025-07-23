import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
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

// Pagination utility functions
const calculateServerPage = (clientPage: number): number => {
  return Math.ceil((clientPage * CLIENT_ITEMS_PER_PAGE) / SERVER_ITEMS_PER_PAGE);
};

const calculateItemsRange = (clientPage: number, serverPage: number) => {
  const globalStartIndex = (clientPage - 1) * CLIENT_ITEMS_PER_PAGE;
  const serverStartIndex = (serverPage - 1) * SERVER_ITEMS_PER_PAGE;
  const localStartIndex = globalStartIndex - serverStartIndex;
  const localEndIndex = localStartIndex + CLIENT_ITEMS_PER_PAGE;
  
  return { localStartIndex, localEndIndex };
};

export const StackOverflowQuestions = () => {
  const classes = useStyles();
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [baseUrl, setBaseUrl] = useState<string>('');
  
  // Questions data using enhanced hook
  const { 
    data: questionsData, 
    loading: questionsLoading, 
    error: questionsError,
    fetchActiveQuestions,
    fetchNewestQuestions,
    fetchTopScoredQuestions,
    fetchUnansweredQuestions
  } = useStackOverflowData('questions');
  
  // Search hook
  const { 
    searchData, 
    loading: searchLoading, 
    error: searchError, 
    search, 
    clearSearch, 
    hasResults,
    totalPages: searchTotalPages,
    currentPage: searchCurrentPage,
    totalCount: searchTotalCount
  } = useStackOverflowSearch();
  
  // Simplified state management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('active');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Determine if we're in search mode
  const isSearchMode = !!searchTerm.trim() && hasResults;

  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  // Calculate required server page for current client page
  const requiredServerPage = useMemo(() => {
    if (isSearchMode) return searchCurrentPage;
    return calculateServerPage(currentPage);
  }, [currentPage, isSearchMode, searchCurrentPage]);

  // Fetch questions based on filter
  const fetchQuestionsForFilter = useCallback((filterId: string, page: number) => {
    switch (filterId) {
      case 'active':
        fetchActiveQuestions(page);
        break;
      case 'newest':
        fetchNewestQuestions(page);
        break;
      case 'score':
        fetchTopScoredQuestions(page);
        break;
      case 'unanswered':
        fetchUnansweredQuestions(page);
        break;
      default:
        fetchActiveQuestions(page);
        break;
    }
  }, [fetchActiveQuestions, fetchNewestQuestions, fetchTopScoredQuestions, fetchUnansweredQuestions]);

  // Load questions when filter or required server page changes
  useEffect(() => {
    if (!isSearchMode) {
      fetchQuestionsForFilter(activeFilter, requiredServerPage);
    }
  }, [activeFilter, requiredServerPage, fetchQuestionsForFilter, isSearchMode]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Handle search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      search(debouncedSearchTerm, 1);
      setCurrentPage(1);
    } else {
      clearSearch();
    }
  }, [debouncedSearchTerm, search, clearSearch]);

  // Handle Enter key press for immediate search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      search(searchTerm, 1);
      setCurrentPage(1);
    }
  };

  // Calculate display data and pagination info
  const displayInfo = useMemo(() => {
    if (isSearchMode) {
      // For search, use the search pagination directly
      return {
        currentPageData: searchData?.items || [],
        totalPages: searchTotalPages,
        totalCount: searchTotalCount,
        currentDisplayPage: searchCurrentPage,
      };
    }

    // For regular questions, slice the server data
    if (!questionsData?.questions) {
      return {
        currentPageData: [],
        totalPages: 1,
        totalCount: 0,
        currentDisplayPage: currentPage,
      };
    }

    const { localStartIndex, localEndIndex } = calculateItemsRange(currentPage, requiredServerPage);
    const currentPageData = questionsData.questions.slice(localStartIndex, localEndIndex);
    
    // Calculate total pages based on total items from server
    const totalServerItems = questionsData.totalCount || 0;
    const totalPages = Math.ceil(totalServerItems / CLIENT_ITEMS_PER_PAGE);

    return {
      currentPageData,
      totalPages,
      totalCount: totalServerItems,
      currentDisplayPage: currentPage,
    };
  }, [
    isSearchMode, 
    searchData?.items, 
    searchTotalPages, 
    searchTotalCount, 
    searchCurrentPage,
    questionsData?.questions,
    questionsData?.totalCount,
    currentPage,
    requiredServerPage
  ]);

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (isSearchMode) {
      search(searchTerm, newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilter(filterId);
  };

  // Determine loading and error states
  const currentLoading = isSearchMode ? searchLoading : questionsLoading;
  const currentError = isSearchMode ? searchError : questionsError;

  if (questionsLoading && !isSearchMode && currentPage === 1) return <Progress />;
  if (questionsError && !isSearchMode) return <ResponseErrorPanel error={questionsError} />;

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

      <div className={classes.pagination}>
        <Button
          disabled={displayInfo.currentDisplayPage <= 1}
          onClick={() => handlePageChange(displayInfo.currentDisplayPage - 1)}
        >
          Previous
        </Button>
        <Typography variant="body1">
          Page {displayInfo.currentDisplayPage} of {displayInfo.totalPages || 1}
        </Typography>
        <Button
          disabled={displayInfo.currentDisplayPage >= displayInfo.totalPages}
          onClick={() => handlePageChange(displayInfo.currentDisplayPage + 1)}
        >
          Next
        </Button>
      </div>

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

      {/* Loading state */}
      {currentLoading && <Progress />}

      {/* Error state */}
      {currentError && <ResponseErrorPanel error={currentError} />}

      {/* No results */}
      {!currentLoading && !currentError && displayInfo.currentPageData.length === 0 && (
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
      {!currentLoading && !currentError && displayInfo.currentPageData.length > 0 && (
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
    </div>
  );
};