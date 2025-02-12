import React, { useState } from 'react';
import { Table } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import { Question } from '../../api';
import { Typography, Box, ButtonGroup, Button } from '@material-ui/core';
import { useStackOverflowStyles } from './hooks'; 

type TableColumn<T> = {
  title: string;
  field: keyof T;
  type?: 'numeric' | 'boolean';
  render?: (row: T) => React.ReactNode;
};

export const StackOverflowQuestionsTable = () => {
  const classes = useStackOverflowStyles(); // Use the reusable styles
  const { data, loading, error } = useStackOverflowData();
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(true);
  const [showBountiedOnly, setShowBountiedOnly] = useState(false);
  const [showNewestFirst, setShowNewestFirst] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [sortByScore, setSortByScore] = useState(false);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  let filteredQuestions = data?.questions || [];
  let activeFilter;

  if (showUnansweredOnly) {
    filteredQuestions = filteredQuestions.filter(q => !q.isAnswered);
    activeFilter = 'Unanswered';
  }

  if (showBountiedOnly) {
    filteredQuestions = filteredQuestions.filter(q => q.bounty !== null);
    activeFilter = 'Bounty';
  }

  if (showNewestFirst) {
    filteredQuestions = filteredQuestions.sort((a, b) => {
      const dateA = new Date(a.creationDate);
      const dateB = new Date(b.creationDate);

      return dateB.getTime() - dateA.getTime();
    });
    activeFilter = 'Newest';
  }

  // This will only include questions that are not older than 30 days, and it will sort questions by activityDate.

  if (showActiveOnly) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    filteredQuestions = filteredQuestions.filter(q => {
      const lastActivityDate = new Date(q.lastActivityDate);
      return lastActivityDate >= thirtyDaysAgo;
    });

    filteredQuestions = filteredQuestions.sort((a, b) => {
      const dateA = new Date(a.lastActivityDate);
      const dateB = new Date(b.lastActivityDate);
      return dateB.getTime() - dateA.getTime();
    });

    activeFilter = 'Active';
  }

  if (sortByScore) {
    let sortedQuestions = filteredQuestions.sort((a, b) => b.score - a.score);
    filteredQuestions = sortedQuestions;
    activeFilter = 'Score';
  }

  const columns: TableColumn<Question>[] = [
    {
      title: 'Title',
      field: 'title',
      render: row => (
        <a href={row.webUrl} target="_blank" rel="noopener noreferrer">
          <Typography className={classes.title}>{row.title}</Typography>
        </a>
      ),
    },
    { title: 'Score', field: 'score', type: 'numeric' },
    { title: 'Answers', field: 'answerCount', type: 'numeric' },
    { title: 'Views', field: 'viewCount', type: 'numeric' },
    { 
      title: 'Created', 
      field: 'lastActivityDate',
      render: row => (
        <Typography>{new Date(row.lastActivityDate).toLocaleString()}</Typography>
      )
    }
    
  ];

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6">Stack Overflow Questions</Typography>
        <ButtonGroup variant="outlined" color="primary">
          <Button
            variant={showUnansweredOnly ? 'contained' : 'outlined'}
            onClick={() => setShowUnansweredOnly(!showUnansweredOnly)}
          >
            Unanswered
          </Button>
          <Button
            variant={showBountiedOnly ? 'contained' : 'outlined'}
            onClick={() => setShowBountiedOnly(!showBountiedOnly)}
          >
            Bountied
          </Button>
          <Button
            variant={showActiveOnly ? 'contained' : 'outlined'}
            onClick={() => setShowActiveOnly(!showActiveOnly)}
          >
            Active
          </Button>
          <Button
            variant={showNewestFirst ? 'contained' : 'outlined'}
            onClick={() => setShowNewestFirst(!showNewestFirst)}
          >
            Newest
          </Button>
          <Button
            variant={sortByScore ? 'contained' : 'outlined'}
            onClick={() => setSortByScore(!sortByScore)}
          >
            Score
          </Button>
        </ButtonGroup>
      </Box>
      <Table
        options={{ search: true, paging: true, sorting: false }}
        columns={columns}
        data={filteredQuestions}
      />
    </>
  );
};

export default StackOverflowQuestionsTable;