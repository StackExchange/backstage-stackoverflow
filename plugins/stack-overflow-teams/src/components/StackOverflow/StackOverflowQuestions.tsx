import React, { useState, useEffect } from 'react';
import {
  makeStyles,
  Theme,
  Grid,
  Paper,
  List,
  Button,
  ButtonGroup,
  Typography,
} from '@material-ui/core';
import {
  SearchBar,
  SearchResult,
  SearchPagination,
} from '@backstage/plugin-search-react';
import { StackOverflowSearchResultListItem } from './StackOverflowSearchResultListItem';
import { StackOverflowIcon } from '../../icons';
import { Content } from '@backstage/core-components';

const useStyles = makeStyles((theme: Theme) => ({
  bar: {
    padding: theme.spacing(1, 0),
  },
  filters: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
  buttonGroup: {
    flexWrap: 'wrap',
  },
  filterButton: {
    textTransform: 'none',
  },
  resultCount: {
    marginTop: theme.spacing(1),
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
  },
}));

const filterAndSortResults = (results: any[], filters: any) => {
  let filtered = results.filter(result => result.type === 'stack-overflow');

  if (filters.showUnansweredOnly) {
    filtered = filtered.filter(q => !q.document.isAnswered);
  }
  if (filters.showBountiedOnly) {
    filtered = filtered.filter(q => q.document.bounty !== null);
  }
  if (filters.showNewestFirst) {
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.document.creationDate).getTime() -
        new Date(a.document.creationDate).getTime(),
    );
  }
  if (filters.showActiveOnly) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filtered = filtered.filter(
      q => new Date(q.document.lastActivityDate) >= thirtyDaysAgo,
    );
    filtered = [...filtered].sort(
      (a, b) =>
        new Date(b.document.lastActivityDate).getTime() -
        new Date(a.document.lastActivityDate).getTime(),
    );
  }
  if (filters.sortByScore) {
    filtered = [...filtered].sort(
      (a, b) => b.document.score - a.document.score,
    );
  }

  return filtered;
};

export const SearchPage = () => {
  const classes = useStyles();
  const [filters, setFilters] = useState({
    showUnansweredOnly: true,
    showBountiedOnly: false,
    showNewestFirst: false,
    showActiveOnly: false,
    sortByScore: false,
  });
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const toggleFilter = (filterName: string) => {
    setFilters(prev => {
      const newFilters = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === filterName;
        return acc;
      }, {} as Record<string, boolean>);
      return newFilters;
    });
  };

  useEffect(() => {
    setFilteredResults(filterAndSortResults(searchResults, filters));
  }, [searchResults, filters]);

  return (
    <Content>
      <Button onClick={() => setModalOpen(true)}>Ask a Question</Button>
      <Grid container spacing={2}>
        {/* Search Bar */}
        <Grid item xs={12}>
          <Paper className={classes.bar}>
            <SearchBar />
          </Paper>
        </Grid>

        {/* Filters Panel */}
        <Grid item xs={12}>
          <Paper className={classes.filters}>
            <ButtonGroup className={classes.buttonGroup}>
              <Button
                variant={filters.showUnansweredOnly ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => toggleFilter('showUnansweredOnly')}
                className={classes.filterButton}
              >
                Unanswered
              </Button>
              <Button
                variant={filters.showBountiedOnly ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => toggleFilter('showBountiedOnly')}
                className={classes.filterButton}
              >
                Bountied
              </Button>
              <Button
                variant={filters.showNewestFirst ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => toggleFilter('showNewestFirst')}
                className={classes.filterButton}
              >
                Newest
              </Button>
              <Button
                variant={filters.showActiveOnly ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => toggleFilter('showActiveOnly')}
                className={classes.filterButton}
              >
                Active
              </Button>
              <Button
                variant={filters.sortByScore ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => toggleFilter('sortByScore')}
                className={classes.filterButton}
              >
                Score
              </Button>
            </ButtonGroup>
          </Paper>
        </Grid>

        <Typography className={classes.resultCount}>
          {`Showing ${filteredResults.length} results`}
        </Typography>

        <Grid item xs={12}>
          <SearchPagination limitOptions={[20]} />
          <SearchResult>
            {({ results }) => {
              setSearchResults(results); // ✅ Store raw search results in state
              return (
                <List>
                  {filteredResults.map(({ type, document }) =>
                    type === 'stack-overflow' ? (
                      <StackOverflowSearchResultListItem
                        key={document.location}
                        result={document}
                        icon={<StackOverflowIcon />}
                      />
                    ) : null,
                  )}
                </List>
              );
            }}
          </SearchResult>
        </Grid>
      </Grid>
    </Content>
  );
};

export const StackOverflowQuestions = SearchPage;
