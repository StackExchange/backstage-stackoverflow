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
import { SearchContextProvider } from '@backstage/plugin-search-react'
import { StackOverflowQuestions, StackOverflowTags, StackOverflowUsers, StackOverflowQuestionsTable } from '../components/StackOverflow';

export const StackOverflowHub = () => (
  <Page themeId="tool">
    <Header
      title="Welcome to Stack Overflow Teams!"
      subtitle="Your knowledge hub."
    >
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Stack Overflow for Teams">
        <SupportButton>
          View a leaderboard of your Stack Overflow instance with top users,
          trending tags, and unanswered questions.
        </SupportButton>
      </ContentHeader>
      <Grid container spacing={3}>
        {/* Recent Questions Section */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Stack Overflow Questions
              </Typography>
              <Box mt={1}>
                <SearchContextProvider>
                <StackOverflowQuestions />
                </SearchContextProvider>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Top Users Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Users
              </Typography>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Users from your Stack Overflow Team
              </Typography>
              <Box mt={2}>
                <StackOverflowUsers />
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
                Explore Stack Overflow Tags
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
