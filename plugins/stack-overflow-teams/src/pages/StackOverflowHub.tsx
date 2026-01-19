import { useEffect, useState } from 'react';
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
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../api';
import {
  StackOverflowQuestions,
  StackOverflowTags,
  StackOverflowUsers,
  StackOverflowMe
} from '../components/StackOverflow';

export const StackOverflowHub = () => {
  const api = useApi(stackoverflowteamsApiRef);
  const [teamName, setTeamName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [teamNameResult, baseUrlResult] = await Promise.all([
          api.getTeamName(),
          api.getBaseUrl()
        ]);
        setTeamName(teamNameResult);
        setBaseUrl(baseUrlResult);
      } catch (error) {
        setBaseUrl('Error retrieving BaseUrl/Team')
      }
    };

    fetchHeaderData();
  }, [api]);

  // Use teamName if available, otherwise fall back to baseUrl
  const instanceValue = teamName || baseUrl || "Loading...";

  return (
  <Page themeId="plugin">
    <Header title="Welcome to Stack Internal!" subtitle="Your team's collective knowledge at your fingertips.">
      <HeaderLabel label="Connected to" value={instanceValue} />
      <HeaderLabel label="Plugin Version" value={`v${packageJson.version}`} />
    </Header>
    <Content>
      <ContentHeader title="Stack Internal"/>
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
                <Tooltip title="Browse and search through your team's questions and articles.">
                  
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
                    <Tooltip title="Information from your Stack Internal profile.">
                      
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
};