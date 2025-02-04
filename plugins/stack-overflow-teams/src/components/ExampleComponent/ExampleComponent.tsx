import React from 'react';
import { Typography, Grid } from '@material-ui/core';
import {
  InfoCard,
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import { ExampleFetchComponent } from '../ExampleFetchComponent';
import { StackOverflowQuestionsTable } from './StackOverflowQuestionsTable';
import StackOverflowPage from './StackOverflowPage';

export const ExampleComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to Stack Overflow Teams!" subtitle="Optional subtitle">
      <HeaderLabel label="Owner" value="Team X" />
      <HeaderLabel label="Lifecycle" value="Alpha" />
    </Header>
    <Content>
      <ContentHeader title="Stack Overflow Questions">
        <SupportButton>View recent Stack Overflow questions.</SupportButton>
      </ContentHeader>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard title="Information Card">
            <Typography variant="body1">
              All content should be wrapped in a card like this.
            </Typography>
          </InfoCard>
        </Grid>
        <Grid item>
          <StackOverflowPage /> 
        </Grid>
      </Grid>
    </Content>
  </Page>
);
