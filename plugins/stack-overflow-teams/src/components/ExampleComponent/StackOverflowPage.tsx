import React from 'react';
import { Content, Page, Header } from '@backstage/core-components';
import { Box, Grid, Paper, Typography } from '@material-ui/core'; // Material-UI for layout
import StackOverflowQuestionsTable from './StackOverflowQuestionsTable';
import StackOverflowTags from './StackOverflowTags';
import StackOverflowTopUsers from './StackOverflowTopUsers';

export const StackOverflowPage = () => {
  return (
    <Page themeId="tool">
      <Header
        title="Stack Overflow Overview"
        subtitle="Explore questions, tags, and top users"
      />

      <Content>
        <Grid container spacing={4}>
          {/* Questions Table Section */}
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
};

export default StackOverflowPage;