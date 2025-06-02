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

export const StackOverflowQuestions = () => {
  const classes = useStyles();
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const { data, loading, error } = useStackOverflowData('questions');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>('active');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  const toggleFilter = (filterId: string) => {
    setActiveFilter(prev => prev === filterId ? null : filterId);
  };

  const filteredQuestions = filterAndSortQuestions(
    (data?.questions || []).filter(question =>
      `${question.title} ${question.tags?.join(' ')}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    ),
    activeFilter,
  );

  const totalPages = Math.ceil(filteredQuestions.length / 5);
  const paginatedQuestions = filteredQuestions.slice(
    currentPage * 5,
    (currentPage + 1) * 5,
  );

  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;

  return (
    <div>
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
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
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Previous
        </Button>
        <Typography variant="body1">
          Page {currentPage + 1} of {totalPages || 1}
        </Typography>
        <Button
          disabled={currentPage >= totalPages - 1}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </Button>
      </div>

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

      <Typography className={classes.resultCount}>
        {`Showing ${filteredQuestions.length} results`}
      </Typography>

      {filteredQuestions.length === 0 && searchTerm !== '' ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1" gutterBottom>
            No questions found matching "{searchTerm}"
          </Typography>
          <Link
            to={`${baseUrl}/search?q=${encodeURIComponent(searchTerm)}`}
          >
            However, you might find more questions on your Stack Overflow Team.
          </Link>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            {paginatedQuestions.map(question => (
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
            <Link to={searchTerm ? `${baseUrl}/search?q=${encodeURIComponent(searchTerm)}` : `${baseUrl}/questions`}>
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