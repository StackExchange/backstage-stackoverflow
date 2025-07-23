import React, { useEffect, useState } from 'react';
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
import { useStackOverflowData, useStackOverflowSearch } from './hooks';
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
  { id: 'bountied', label: 'Bountied' },
  { id: 'newest', label: 'Newest' },
  { id: 'active', label: 'Active' },
  { id: 'score', label: 'Score' },
];

const filterAndSortQuestions = (questions: any[], activeFilter: string | null) => {
  let filtered = [...questions];

  switch (activeFilter) {
    case 'unanswered':
      filtered = filtered.filter(q => !q.isAnswered);
      break;
    case 'bountied':
      filtered = filtered.filter(q => q.bounty > 0);
      break;
    case 'newest':
      filtered.sort(
        (a, b) =>
          new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime(),
      );
      break;
    case 'active': {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(
        q => new Date(q.lastActivityDate) >= thirtyDaysAgo,
      );
      filtered.sort(
        (a, b) =>
          new Date(b.lastActivityDate).getTime() -
          new Date(a.lastActivityDate).getTime(),
      );
      break;
    }
    case 'score':
      filtered.sort((a, b) => b.score - a.score);
      break;
    default:
  }

  return filtered;
};

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

export const StackOverflowQuestions = () => {
  const classes = useStyles();
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [baseUrl, setBaseUrl] = useState<string>('');
  
  // Questions API data
  const { data: questionsData, loading: questionsLoading, error: questionsError } = useStackOverflowData('questions');
  
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
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>('active');
  const [questionsCurrentPage, setQuestionsCurrentPage] = useState(1); // Frontend pagination for questions

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Determine if we're in search mode
  const isSearchMode = !!searchTerm.trim() && hasResults;

  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  // Reset questions pagination when filter changes
  useEffect(() => {
    setQuestionsCurrentPage(0);
  }, [activeFilter]);

  // Handle search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      search(debouncedSearchTerm, 1); // Start from page 1
    } else {
      clearSearch();
    }
  }, [debouncedSearchTerm, search, clearSearch]);

  // Handle Enter key press for immediate search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      search(searchTerm, 1);
    }
  };

  // Handle search pagination
  const handleSearchPageChange = (newPage: number) => {
    if (searchTerm.trim()) {
      search(searchTerm, newPage);
    }
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilter(prev => prev === filterId ? null : filterId);
  };

  // Determine which data to use
  const currentData = isSearchMode ? (searchData?.items || []) : (questionsData?.questions || []);
  const currentLoading = isSearchMode ? searchLoading : questionsLoading;
  const currentError = isSearchMode ? searchError : questionsError;

  // Process data based on mode
  let processedData = currentData;
  let totalPages = 1;
  let paginatedData = currentData;
  let currentPageDisplay = 1;

  if (isSearchMode) {
    // Search mode: use backend pagination
    paginatedData = currentData;
    totalPages = searchTotalPages;
    currentPageDisplay = searchCurrentPage;
  } else {
    // Questions mode: use frontend pagination with filters
    processedData = filterAndSortQuestions(currentData, activeFilter);
    totalPages = Math.ceil(processedData.length / 5);
    paginatedData = processedData.slice(
      questionsCurrentPage * 5,
      (questionsCurrentPage + 1) * 5,
    );
    currentPageDisplay = questionsCurrentPage + 1;
  }

  if (questionsLoading && !isSearchMode) return <Progress />;
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
          disabled={isSearchMode ? searchCurrentPage <= 1 : questionsCurrentPage === 0}
          onClick={() => {
            if (isSearchMode) {
              handleSearchPageChange(searchCurrentPage - 1);
            } else {
              setQuestionsCurrentPage(prev => prev - 1);
            }
          }}
        >
          Previous
        </Button>
        <Typography variant="body1">
          Page {currentPageDisplay} of {totalPages || 1}
        </Typography>
        <Button
          disabled={isSearchMode ? searchCurrentPage >= searchTotalPages : questionsCurrentPage >= totalPages - 1}
          onClick={() => {
            if (isSearchMode) {
              handleSearchPageChange(searchCurrentPage + 1);
            } else {
              setQuestionsCurrentPage(prev => prev + 1);
            }
          }}
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
          ? `Search results: ${searchTotalCount} total found` 
          : `Showing ${processedData.length} results`}
      </Typography>

      {/* Loading state */}
      {currentLoading && <Progress />}

      {/* Error state */}
      {currentError && <ResponseErrorPanel error={currentError} />}

      {/* No results */}
      {!currentLoading && !currentError && paginatedData.length === 0 && (
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
      {!currentLoading && !currentError && paginatedData.length > 0 && (
        <>
          <Grid container spacing={2}>
            {paginatedData.map(question => (
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