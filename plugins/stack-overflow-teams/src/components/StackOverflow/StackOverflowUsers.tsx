import React, { useEffect, useState } from 'react';
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import {
  Grid,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
} from '@material-ui/core';
import { stackoverflowteamsApiRef, User } from '../../api';
import SearchIcon from '@material-ui/icons/Search';
import LaunchIcon from '@material-ui/icons/Launch';
import PersonIcon from '@material-ui/icons/Person';
import BusinessIcon from '@material-ui/icons/Business';
import { makeStyles } from '@material-ui/core/styles';
import { useApi } from '@backstage/core-plugin-api';

const useStyles = makeStyles(theme => ({
  searchBox: {
    marginBottom: theme.spacing(3),
  },
  userCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: theme.transitions.create(['box-shadow', 'transform'], {
      duration: theme.transitions.duration.short,
    }),
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  cardContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:last-child': {
      paddingBottom: theme.spacing(2),
    },
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    minHeight: theme.spacing(6), // Ensures consistent header height
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  userName: {
    lineHeight: 1.2,
    minHeight: theme.spacing(3), // Consistent name height
  },
  jobTitle: {
    minHeight: theme.spacing(2.5), // Consistent job title height
  },
  departmentContainer: {
    minHeight: theme.spacing(2.5), // Consistent department height
  },
  cardFooter: {
    marginTop: 'auto', // Push footer to bottom
    paddingTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: theme.spacing(4), // Consistent footer height
  },
  reputationChip: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    minWidth: theme.spacing(8), // Consistent chip width
  },
  roleChip: {
    minWidth: theme.spacing(7), // Consistent role chip width
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(6, 2),
  },
  exploreMore: {
    textAlign: 'center',
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
  },
}));

const UserCard = ({ user }: { user: User }) => {
  const classes = useStyles();
  const isModerator = user.role === 'Moderator';
  const isAdmin = user.role === 'Admin';

  const handleCardClick = () => {
    window.open(user.webUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={classes.userCard} onClick={handleCardClick}>
      <CardContent className={classes.cardContent}>
        <Box className={classes.cardHeader}>
          <Avatar 
            src={user.avatarUrl} 
            alt={user.name}
            className={classes.avatar}
          >
            <PersonIcon />
          </Avatar>
          <Box className={classes.userInfo}>
            <Typography 
              variant="h6" 
              noWrap 
              className={classes.userName}
            >
              {user.name}
            </Typography>
            <Box className={classes.jobTitle}>
              {user.jobTitle ? (
                <Typography variant="body2" color="textSecondary" noWrap>
                  {user.jobTitle}
                </Typography>
              ) : (
                <Box /> // Empty box to maintain consistent spacing
              )}
            </Box>
            <Box className={classes.departmentContainer}>
              {user.department ? (
                <Box display="flex" alignItems="center">
                  <BusinessIcon fontSize="small" color="disabled" />
                  <Box ml={0.5}>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {user.department}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box /> // Empty box to maintain consistent spacing
              )}
            </Box>
          </Box>
          <IconButton size="small" aria-label="open profile">
            <LaunchIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box className={classes.cardFooter}>
          <Chip
            size="small"
            label={`${user.reputation.toLocaleString()} rep`}
            className={classes.reputationChip}
            variant="default"
          />
          <Box>
            {(isModerator || isAdmin) && (
              <Chip
                label={isModerator ? 'Moderator' : 'Admin'}
                size="small"
                color={isModerator ? 'primary' : 'secondary'}
                variant="outlined"
                className={classes.roleChip}
              />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const StackOverflowUserList = ({
  users,
  searchTerm,
  baseUrl,
}: {
  users: User[];
  searchTerm: string;
  baseUrl: string;
}) => {
  const classes = useStyles();

  if (users.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <PersonIcon fontSize="large" color="disabled" />
        <Typography variant="h6" gutterBottom>
          No users found matching "{searchTerm}"
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Try adjusting your search terms
        </Typography>
        <Link to={`${baseUrl}/users`}>
          <Typography variant="body1" color="primary">
            Browse all users →
          </Typography>
        </Link>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {users.map(user => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
            <UserCard user={user} />
          </Grid>
        ))}
      </Grid>
      
      {users.length > 0 && (
        <Box className={classes.exploreMore}>
          <Link to={`${baseUrl}/users`}>
            <Typography variant="body1" color="primary">
              Explore more users →
            </Typography>
          </Link>
        </Box>
      )}
    </>
  );
};

export const StackOverflowUsers = () => {
  const classes = useStyles();
  const { data, loading, error, fetchData } = useStackOverflowData('users');
  const [searchTerm, setSearchTerm] = useState('');
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    stackOverflowTeamsApi.getBaseUrl().then(url => setBaseUrl(url));
  }, [stackOverflowTeamsApi]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const filteredUsers = (data?.users || [])
    .sort((a, b) => b.reputation - a.reputation)
    .filter(user =>
      `${user.name} ${user.jobTitle} ${user.department} ${user.role}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

  return (
    <Box>
      <Box className={classes.searchBox}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search users..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <StackOverflowUserList
        users={filteredUsers}
        searchTerm={searchTerm}
        baseUrl={baseUrl}
      />
    </Box>
  );
};

export default StackOverflowUsers;