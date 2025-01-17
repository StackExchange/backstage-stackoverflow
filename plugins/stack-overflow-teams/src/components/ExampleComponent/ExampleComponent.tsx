import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Grid, Chip, Paper, Avatar } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';

export const ExampleComponent = () => {
  const [questions, setQuestions] = useState([]);
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch questions, tags, and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsResponse = await axios.get('http://localhost:7007/api/stack-overflow-teams/questions');
        const tagsResponse = await axios.get('http://localhost:7007/api/stack-overflow-teams/tags');
        const usersResponse = await axios.get('http://localhost:7007/api/stack-overflow-teams/users');

        setQuestions(questionsResponse.data.items);
        setTags(tagsResponse.data.items);
        setUsers(usersResponse.data.items);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Page themeId="tool">
      <Header title="Welcome to Stack Overflow Teams!" subtitle="Explore your team's questions, tags, and users">
        <HeaderLabel label="Owner" value="Team X" />
        <HeaderLabel label="Lifecycle" value="Alpha" />
      </Header>
      <Content>
        <ContentHeader title="Plugin Overview">
          <SupportButton>
            This plugin shows a list of unanswered questions, tags, and users from Stack Overflow Teams.
          </SupportButton>
        </ContentHeader>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <InfoCard title="Unanswered Questions">
              {loading ? (
                <Typography variant="body1">Loading questions...</Typography>
              ) : error ? (
                <Typography variant="body1" color="error">
                  {error}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {questions.map((question) => (
                    <Grid item xs={12} sm={6} md={4} key={question.id}>
                      <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
                        <Typography variant="h6" component="h2">
                          <a href={question.webUrl} target="_blank" rel="noopener noreferrer">
                            {question.title}
                          </a>
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </InfoCard>
          </Grid>

          <Grid item xs={12}>
            <InfoCard title="Tags">
              {loading ? (
                <Typography variant="body1">Loading tags...</Typography>
              ) : error ? (
                <Typography variant="body1" color="error">
                  {error}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {tags.map((tag) => (
                    <Grid item xs={12} sm={6} md={4} key={tag.id}>
                      <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
                        <Typography variant="h6" component="h2">
                          <a href={tag.webUrl} target="_blank" rel="noopener noreferrer">
                            {tag.name}
                          </a>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {tag.description}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Post count: {tag.postCount}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </InfoCard>
          </Grid>

          <Grid item xs={12}>
            <InfoCard title="Users">
              {loading ? (
                <Typography variant="body1">Loading users...</Typography>
              ) : error ? (
                <Typography variant="body1" color="error">
                  {error}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {users.map((user) => (
                    <Grid item xs={12} sm={6} md={4} key={user.id}>
                      <Paper elevation={3} style={{ padding: '16px', height: '100%' }}>
                        <Grid container spacing={2}>
                          <Grid item>
                            <Avatar src={user.avatarUrl} alt={user.name} />
                          </Grid>
                          <Grid item xs={10}>
                            <Typography variant="h6" component="h2">
                              <a href={user.webUrl} target="_blank" rel="noopener noreferrer">
                                {user.name}
                              </a>
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {user.jobTitle || 'Job Title Not Available'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Department: {user.department || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Reputation: {user.reputation}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Role: {user.role}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
