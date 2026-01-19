import { useEffect, useState, useCallback } from 'react';
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import {
  Chip,
  Grid,
  TextField,
  Box,
  Typography,
  InputAdornment,
} from '@material-ui/core';
import { Tag } from '../../types';
import SearchIcon from '@material-ui/icons/Search';
import { stackoverflowteamsApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';

const StackOverflowTagList = ({
  tags,
  searchTerm,
  isApiSearch = false,
  isSearching = false,
}: {
  tags: Tag[];
  searchTerm: string;
  baseUrl: string;
  isApiSearch?: boolean;
  isSearching?: boolean;
}) => {
  if (isSearching) {
    return null; 
  }

  if (tags.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" gutterBottom>
          {isApiSearch 
            ? `No tags found for "${searchTerm}" on your Stack Overflow Internal Team`
            : `No matching tags were found for "${searchTerm}"`
          }
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={1}>
      {tags.map(tag => (
        <Link key={tag.name} to={tag.webUrl} noTrack>
          <Chip
            label={`${tag.name}(${tag.postCount})`}
            variant="outlined"
            clickable
          />
        </Link>
      ))}
    </Grid>
  );
};

export const StackOverflowTags = () => {
  const { data, loading, error, fetchData } = useStackOverflowData('tags');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState<Tag[] | null>(null);
  const [apiSearchLoading, setApiSearchLoading] = useState(false);
  const [apiSearchError, setApiSearchError] = useState<Error | null>(null);
  const [hasAttemptedApiSearch, setHasAttemptedApiSearch] = useState(false);
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);

  const [baseUrl, setBaseUrl] = useState<string>('');
  
  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced API search function
  const searchTagsViaApi = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setApiSearchResults(null);
      setHasAttemptedApiSearch(false);
      return;
    }

    setApiSearchLoading(true);
    setApiSearchError(null);
    setHasAttemptedApiSearch(false);
    
    try {
      const response = await stackOverflowTeamsApi.getTags(searchQuery);
      setApiSearchResults(response.items || []);
    } catch (err) {
      setApiSearchError(err as Error);
      setApiSearchResults([]);
    } finally {
      setApiSearchLoading(false);
      setHasAttemptedApiSearch(true);
    }
  }, [stackOverflowTeamsApi]);

  // Debounce the search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      const localFilteredTags = (data?.tags || []).filter(tag =>
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      // If no local results and we have a search term, try API search
      if (localFilteredTags.length === 0 && searchTerm.trim()) {
        searchTagsViaApi(searchTerm);
      } else {
        // Reset API search results when we have local results or no search term
        setApiSearchResults(null);
        setApiSearchError(null);
        setHasAttemptedApiSearch(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, data?.tags, searchTagsViaApi]);

  const localFilteredTags = (data?.tags || []).filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const shouldShowApiResults = localFilteredTags.length === 0 && searchTerm.trim() && hasAttemptedApiSearch && apiSearchResults !== null;
  const tagsToShow = shouldShowApiResults ? apiSearchResults : localFilteredTags;
  const isShowingApiResults = shouldShowApiResults;
  const currentLoading = apiSearchLoading;
  const currentError = apiSearchError;

  const shouldShowResults = !currentLoading && !currentError && (
    // Show local results if we have them
    localFilteredTags.length > 0 ||
    // Show API results if we have attempted API search and got results
    (hasAttemptedApiSearch && apiSearchResults !== null)
  );

  return (
    <div>
      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Filter tags..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Show initial loading state */}
      {loading && <Progress />}
      
      {/* Show initial error state */}
      {error && <ResponseErrorPanel error={error} />}
      
      {/* Only show content when initial data is loaded */}
      {!loading && !error && (
        <>
          {/* Show API search loading */}
          {currentLoading && <Progress />}
          
          {/* Show API search error */}
          {currentError && <ResponseErrorPanel error={currentError} />}
          
          {/* Show results when appropriate */}
          {shouldShowResults && (
            <StackOverflowTagList
              tags={tagsToShow || []}
              searchTerm={searchTerm}
              baseUrl={baseUrl}
              isApiSearch={!!isShowingApiResults}
              isSearching={currentLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StackOverflowTags;