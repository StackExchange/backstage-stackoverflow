import React, { useEffect, useState } from 'react';
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
  baseUrl, // Use the baseUrl prop
}: {
  tags: Tag[];
  searchTerm: string;
  baseUrl: string;
}) => {
  if (tags.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" gutterBottom>
          No matching tags were found for "{searchTerm}"
        </Typography>
        <Link
          to={`${baseUrl}/tags?query=${encodeURIComponent(searchTerm)}`} // Use baseUrl here
        >
          However, you might find this tag on your Stack Overflow Team.
        </Link>
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

      <Grid item xs={12}>
        <Link to={`${baseUrl}/tags`}>
        <Typography variant='body1'>
          Explore more tags on your Stack Overflow Team
          </Typography>
        </Link>
      </Grid>
    </Grid>
  );
};

export const StackOverflowTags = () => {
  const { data, loading, error } = useStackOverflowData('tags');
  const [searchTerm, setSearchTerm] = useState('');
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);

  const [baseUrl, setBaseUrl] = useState<string>('');
  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const filteredTags = (data?.tags || []).filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()),
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

      <StackOverflowTagList
        tags={filteredTags}
        searchTerm={searchTerm}
        baseUrl={baseUrl}
      />
    </div>
  );
};

export default StackOverflowTags;
