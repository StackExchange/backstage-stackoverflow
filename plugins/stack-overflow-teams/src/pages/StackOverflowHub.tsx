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
import { SearchContextProvider } from '@backstage/plugin-search-react';
import {
  StackOverflowQuestions,
  StackOverflowTags,
  StackOverflowUsers,
  StackOverflowQuestionsTable,
} from '../components/StackOverflow';
import { StackOverflowAuthStart } from '../components/StackOverflowAuth/StackAuthStart';

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
      <StackOverflowAuthStart />
      <SearchContextProvider>
        <StackOverflowQuestions />
      </SearchContextProvider>
    </Content>
  </Page>
);
