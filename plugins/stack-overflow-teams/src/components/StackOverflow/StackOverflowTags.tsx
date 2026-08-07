import React, { useEffect, useState, useCallback } from 'react';
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import {
  Chip,
  TextField,
  Box,
  Typography,
  InputAdornment,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Tag } from '../../types';
import SearchIcon from '@material-ui/icons/Search';
import LocalOfferOutlined from '@material-ui/icons/LocalOfferOutlined';
import { stackoverflowteamsApiRef } from '../../api';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles((theme: Theme) => ({
  searchField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
    },
  },
  tagList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
  tag: {
    height: 30,
    color: theme.palette.type === 'dark' ? '#D5E8F7' : '#294E68',
    backgroundColor: theme.palette.type === 'dark' ? '#253746' : '#EAF3F8',
    borderColor: theme.palette.type === 'dark' ? '#466176' : '#B8D2E4',
    borderRadius: 5,
    fontWeight: 600,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(4, 2),
    textAlign: 'center',
  },
  emptyIcon: {
    color: theme.palette.text.disabled,
    fontSize: 36,
    marginBottom: theme.spacing(1),
  },
  searchStatus: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1.5),
  },
}));

const StackOverflowTagList: React.FC<{
  tags: Tag[];
  searchTerm: string;
  isSearching?: boolean;
}> = ({
  tags,
  searchTerm,
  isSearching = false,
}) => {
  const classes = useStyles();

  if (isSearching) {
    return null;
  }

  if (tags.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <LocalOfferOutlined className={classes.emptyIcon} />
        <Typography variant="subtitle1" gutterBottom>
          {searchTerm
            ? `No tags match “${searchTerm}”`
            : 'No tags available yet'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {searchTerm
            ? 'Try a shorter or more general topic.'
            : 'Tags will appear as your team organizes its knowledge.'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.tagList}>
      {tags.map(tag => (
        <Link key={tag.name} to={tag.webUrl} noTrack>
          <Chip
            label={`${tag.name} · ${tag.postCount.toLocaleString()}`}
            variant="outlined"
            clickable
            className={classes.tag}
          />
        </Link>
      ))}
    </Box>
  );
};

export const StackOverflowTags: React.FC = () => {
  const classes = useStyles();
  const { data, loading, error, fetchData } = useStackOverflowData('tags');
  const [searchTerm, setSearchTerm] = useState('');
  const [apiSearchResults, setApiSearchResults] = useState<Tag[] | null>(null);
  const [apiSearchLoading, setApiSearchLoading] = useState(false);
  const [apiSearchError, setApiSearchError] = useState<Error | null>(null);
  const [hasAttemptedApiSearch, setHasAttemptedApiSearch] = useState(false);
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);

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
  const currentLoading = apiSearchLoading;
  const currentError = apiSearchError;

  return (
    <div>
      <Box mb={2}>
        <TextField
          fullWidth
          variant="outlined"
          label="Filter tags"
          placeholder="Search by topic"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={classes.searchField}
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
          {currentLoading && (
            <>
              <Typography variant="body2" className={classes.searchStatus}>
                Searching all team tags…
              </Typography>
              <Progress />
            </>
          )}
          
          {/* Show API search error */}
          {currentError && <ResponseErrorPanel error={currentError} />}
          
          {!currentLoading && !currentError && (
            <StackOverflowTagList
              tags={tagsToShow || []}
              searchTerm={searchTerm}
              isSearching={currentLoading}
            />
          )}
        </>
      )}
    </div>
  );
};

export default StackOverflowTags;
