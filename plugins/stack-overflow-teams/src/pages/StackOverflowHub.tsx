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
import {
  StackOverflowQuestions,
  StackOverflowTags,
  StackOverflowUsers,
} from '../components/StackOverflow';
import { StackOverflowMe } from '../components/StackOverflow/StackOverflowMe';

export const StackOverflowHub = () => (
  <Page themeId="plugin">
    <Header title="Welcome to Stack Overflow Teams!" subtitle="Your knowledge hub.">
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
        {/* Main Questions Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box p={3}>
              <Typography variant="h5" gutterBottom>
                Stack Overflow Questions
              </Typography>
              <Box mt={1}>
                  <StackOverflowQuestions />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* User Info & Tags Section */}
        <Grid item xs={12} md={4}>
          <Grid container spacing={3}>
            {/* StackOverflowMe Section */}
            <Grid item xs={12}>
              <Paper elevation={3}>
                <Box p={3}>
                  <StackOverflowMe />
                </Box>
              </Paper>
            </Grid>
            {/* Tags Section */}
            <Grid item xs={12}>
              <Paper elevation={3}>
                <Box p={2}>
                  <Box mt={1}>
                    <StackOverflowTags />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        {/* Users Section */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Box p={3}>
        
              <Box mt={2}>
                <StackOverflowUsers />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
