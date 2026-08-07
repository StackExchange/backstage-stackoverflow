import React, { ReactNode, useEffect, useState } from 'react';
import packageJson from '../../package.json';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import HelpOutline from '@material-ui/icons/HelpOutline';
import QuestionAnswer from '@material-ui/icons/QuestionAnswer';
import Person from '@material-ui/icons/Person';
import LocalOffer from '@material-ui/icons/LocalOffer';
import People from '@material-ui/icons/People';
import {
  Header,
  Page,
  Content,
  HeaderLabel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../api';
import {
  StackOverflowQuestions,
  StackOverflowTags,
  StackOverflowUsers,
  StackOverflowMe,
} from '../components/StackOverflow';

const useStyles = makeStyles((theme: Theme) => ({
  content: {
    backgroundColor: theme.palette.background.default,
  },
  introduction: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(3),
    padding: theme.spacing(1, 0, 4),
    [theme.breakpoints.down('sm')]: {
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
  },
  introductionCopy: {
    maxWidth: '70ch',
  },
  introductionTitle: {
    fontWeight: 700,
    letterSpacing: '-0.02em',
    marginBottom: theme.spacing(1),
  },
  actionButton: {
    flexShrink: 0,
    backgroundColor: '#F48024',
    color: '#fff',
    fontWeight: 700,
    padding: theme.spacing(1.25, 2.25),
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#FF9D52' : '#D9680F',
    },
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.type === 'dark' ? '#FFB679' : '#9E4800'}`,
      outlineOffset: 2,
    },
  },
  section: {
    height: '100%',
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    boxShadow:
      theme.palette.type === 'dark'
        ? '0 10px 28px rgba(0, 0, 0, 0.22)'
        : '0 10px 28px rgba(31, 35, 40, 0.07)',
  },
  sectionContent: {
    padding: theme.spacing(3),
    [theme.breakpoints.down('xs')]: {
      padding: theme.spacing(2),
    },
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  sectionIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    minWidth: 0,
  },
  sectionIcon: {
    display: 'grid',
    placeItems: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 12,
    color: theme.palette.type === 'dark' ? '#FFB37A' : '#A84200',
    backgroundColor: theme.palette.type === 'dark' ? '#442514' : '#FFF0E4',
  },
  sectionTitle: {
    fontWeight: 700,
    letterSpacing: '-0.015em',
  },
  sectionDescription: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.25),
  },
  helpButton: {
    color: theme.palette.text.secondary,
    marginTop: -4,
  },
}));

type SectionHeaderProps = {
  title: string;
  description: string;
  helpText: string;
  icon: ReactNode;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  helpText,
  icon,
}: SectionHeaderProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.sectionHeader}>
      <Box className={classes.sectionIdentity}>
        <Box className={classes.sectionIcon} aria-hidden="true">
          {icon}
        </Box>
        <Box minWidth={0}>
          <Typography variant="h5" className={classes.sectionTitle}>
            {title}
          </Typography>
          <Typography variant="body2" className={classes.sectionDescription}>
            {description}
          </Typography>
        </Box>
      </Box>
      <Tooltip title={helpText} arrow>
        <IconButton
          size="small"
          className={classes.helpButton}
          aria-label={`About ${title}`}
        >
          <HelpOutline fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export const StackOverflowHub: React.FC = () => {
  const classes = useStyles();
  const api = useApi(stackoverflowteamsApiRef);
  const [teamName, setTeamName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const [teamNameResult, baseUrlResult] = await Promise.all([
          api.getTeamName(),
          api.getBaseUrl(),
        ]);
        setTeamName(teamNameResult);
        setBaseUrl(baseUrlResult);
      } catch (error) {
        setBaseUrl('Connection unavailable');
      }
    };

    fetchHeaderData();
  }, [api]);

  const instanceValue = teamName || baseUrl || 'Connecting…';
  const openAskQuestionModal = () =>
    window.dispatchEvent(new Event('openAskQuestionModal'));

  return (
    <Page themeId="plugin">
      <Header
        title="Stack Internal"
        subtitle="Your team’s collective knowledge, available without leaving Backstage."
      >
        <HeaderLabel label="Connected to" value={instanceValue} />
        <HeaderLabel label="Plugin version" value={`v${packageJson.version}`} />
      </Header>
      <Content className={classes.content}>
        <Box className={classes.introduction}>
          <Box className={classes.introductionCopy}>
            <Typography variant="h4" className={classes.introductionTitle}>
              Find answers. Share what you know.
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Search trusted team knowledge, explore the topics people use most,
              and connect with the experts behind the answers.
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            startIcon={<QuestionAnswer />}
            className={classes.actionButton}
            onClick={openAskQuestionModal}
          >
            Ask a question
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} className={classes.section}>
              <Box className={classes.sectionContent}>
                <SectionHeader
                  icon={<QuestionAnswer />}
                  title="Questions"
                  description="Recent conversations and answers from across your team."
                  helpText="Browse, filter, and search your team’s questions and articles."
                />
                <StackOverflowQuestions />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper elevation={0} className={classes.section}>
                  <Box className={classes.sectionContent}>
                    <SectionHeader
                      icon={<Person />}
                      title="My profile"
                      description="Your identity and reputation in this community."
                      helpText="Profile information from your Stack Internal account."
                    />
                    <StackOverflowMe />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} className={classes.section}>
                  <Box className={classes.sectionContent}>
                    <SectionHeader
                      icon={<LocalOffer />}
                      title="Popular tags"
                      description="Topics your team is discussing right now."
                      helpText="Popular tags used to organize your team’s questions."
                    />
                    <StackOverflowTags />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0} className={classes.section}>
              <Box className={classes.sectionContent}>
                <SectionHeader
                  icon={<People />}
                  title="Team members"
                  description="Discover contributors and find people with relevant expertise."
                  helpText="Team members, their roles, and their reputation scores."
                />
                <StackOverflowUsers />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
