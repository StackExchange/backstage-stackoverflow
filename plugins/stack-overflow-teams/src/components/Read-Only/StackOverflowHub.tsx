import React from 'react';
import { Typography, Grid, Box, Paper } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import StackOverflowQuestionsTable from './StackOverflowQuestionsTable';
import StackOverflowTags from './StackOverflowTags';
import StackOverflowTopUsers from './StackOverflowTopUsers';

// FIX RESPONSIVENESS https://stackoverflow.com/questions/73302887/mui-table-is-not-responsive

export const StackOverflowHub = () => (
  <Page themeId="tool">
    <Header title="Welcome to Stack Overflow Teams!" subtitle="Your knowledge hub.">
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Stack Overflow for Teams">
        <SupportButton>
          View a leaderboard of your Stack Overflow instance with top users, trending tags, and unanswered questions.
        </SupportButton>
      </ContentHeader>
      <Grid container spacing={3}>
        {/* Recent Questions Section */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Recent Stack Overflow Questions
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                View recent questions from Stack Overflow
              </Typography>
              <Box mt={2}>
                <StackOverflowQuestionsTable />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Top Users Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Top Users
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Top users based on reputation
              </Typography>
              <Box mt={2}>
                <StackOverflowTopUsers />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Tags Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Stack Overflow Tags
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Explore popular tags
              </Typography>
              <Box mt={2}>
                <StackOverflowTags />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
