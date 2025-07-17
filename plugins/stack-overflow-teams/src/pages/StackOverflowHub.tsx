import React from 'react';
import packageJson from '../../package.json'
import { Typography, Grid, Box, Paper, Tooltip } from '@material-ui/core';
import Help from '@material-ui/icons/Help';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import Person from '@material-ui/icons/Person';
import LocalOffer from '@material-ui/icons/LocalOffer';
import People from '@material-ui/icons/People';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
} from '@backstage/core-components';
import {
  StackOverflowQuestions,
  StackOverflowTags,
  StackOverflowUsers,
  StackOverflowMe
} from '../components/StackOverflow';

export const StackOverflowHub = () => (
  <Page themeId="plugin">
    <Header title="Welcome to Stack Overflow Teams!" subtitle="Your team's collective knowledge at your fingertips.">
      <HeaderLabel label="Owner" value="Stack Overflow" />
      <HeaderLabel label="Plugin Version" value={`v${packageJson.version}`} />
    </Header>
    <Content>
      <ContentHeader title="Stack Overflow for Teams"/>
      <Grid container spacing={3}>
        {/* Main Questions Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3}>
            <Box p={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <QuestionAnswer style={{ marginRight: 8 }} />
                  <Typography variant="h5" gutterBottom>
                    Questions
                  </Typography>
                </Box>
                <Tooltip title="Browse and search through your team's questions.">
                  
                    <Help />
                  
                </Tooltip>
              </Box>
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
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Person style={{ marginRight: 8 }} />
                        <Typography variant="h6">
                          My Profile
                        </Typography>
                      </Box>
                      <StackOverflowMe />
                    </Box>
                    <Tooltip title="Information from your Stack Overflow for Teams profile.">
                      
                        <Help />
                      
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            {/* Tags Section */}
            <Grid item xs={12}>
              <Paper elevation={3}>
                <Box p={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center">
                      <LocalOffer style={{ marginRight: 8 }} />
                      <Typography variant="h6">
                        Tags
                      </Typography>
                    </Box>
                    <Tooltip title="Popular tags used in your team to categorize and organize questions">
                      
                        <Help />
                      
                    </Tooltip>
                  </Box>
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
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <People style={{ marginRight: 8 }} />
                  <Typography variant="h5">
                    Team Members
                  </Typography>
                </Box>
                <Tooltip title="Team members, their role, reputation scores.">
                  
                    <Help />
                  
                </Tooltip>
              </Box>
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