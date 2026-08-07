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
  searchField: {
    '& .MuiOutlinedInput-root': {
      borderRadius: 8,
    },
  },
  userLink: {
    display: 'block',
    height: '100%',
    borderRadius: 12,
    textDecoration: 'none',
    '&:focus-visible': {
      outline: `3px solid ${theme.palette.type === 'dark' ? '#FFB679' : '#A84200'}`,
      outlineOffset: 3,
    },
  },
  userCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 12,
    boxShadow: 'none',
    transition: theme.transitions.create(['border-color', 'background-color'], {
      duration: theme.transitions.duration.short,
    }),
    '&:hover': {
      borderColor: theme.palette.type === 'dark' ? '#8A5A35' : '#C75B0A',
      backgroundColor: theme.palette.action.hover,
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
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
  },
  userName: {
    lineHeight: 1.2,
    fontWeight: 700,
  },
  cardFooter: {
    marginTop: 'auto',
    paddingTop: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  reputationChip: {
    color: theme.palette.type === 'dark' ? '#FFD2B0' : '#7A3300',
    backgroundColor: theme.palette.type === 'dark' ? '#422615' : '#FFF0E4',
    fontWeight: 700,
  },
  roleChip: {
    fontWeight: 700,
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  launchIcon: {
    color: theme.palette.text.secondary,
    flexShrink: 0,
  },
  emptyState: {
    textAlign: 'center',
    padding: theme.spacing(6, 2),
  },
  exploreMore: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.palette.divider}`,
    textAlign: 'right',
  },
}));

const UserCard: React.FC<{ user: User }> = ({ user }) => {
  const classes = useStyles();
  const isModerator = user.role === 'Moderator';
  const isAdmin = user.role === 'Admin';

  return (
    <Link
      to={user.webUrl}
      target="_blank"
      rel="noopener noreferrer"
      noTrack
      className={classes.userLink}
      aria-label={`Open ${user.name}’s Stack Internal profile`}
    >
      <Card className={classes.userCard}>
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
              <Typography variant="subtitle1" noWrap className={classes.userName}>
                {user.name}
              </Typography>
              {user.jobTitle && (
                <Typography variant="body2" color="textSecondary" noWrap>
                  {user.jobTitle}
                </Typography>
              )}
              {user.department && (
                <Box display="flex" alignItems="center">
                  <BusinessIcon fontSize="small" color="disabled" />
                  <Box ml={0.5} minWidth={0}>
                    <Typography variant="body2" color="textSecondary" noWrap>
                      {user.department}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
            <LaunchIcon fontSize="small" className={classes.launchIcon} />
          </Box>
          
          <Box className={classes.cardFooter}>
            <Chip
              size="small"
              label={`${user.reputation.toLocaleString()} rep`}
              className={classes.reputationChip}
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
    </Link>
  );
};

const StackOverflowUserList: React.FC<{
  users: User[];
  searchTerm: string;
  baseUrl: string;
}> = ({
  users,
  searchTerm,
  baseUrl,
}) => {
  const classes = useStyles();

  if (users.length === 0) {
    return (
      <Box className={classes.emptyState}>
        <PersonIcon fontSize="large" color="disabled" />
        <Typography variant="h6" gutterBottom>
          {searchTerm ? `No members match “${searchTerm}”` : 'No members to show'}
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          {searchTerm
            ? 'Try a name, role, department, or job title.'
            : 'Team members will appear when profiles become available.'}
        </Typography>
        <Link to={`${baseUrl}/users`}>
          <Typography variant="body1" color="primary">
            Browse all team members →
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
              Explore all team members →
            </Typography>
          </Link>
        </Box>
      )}
    </>
  );
};

export const StackOverflowUsers: React.FC = () => {
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

  const filteredUsers = [...(data?.users || [])]
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
          label="Search team members"
          placeholder="Name, role, department, or job title"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className={classes.searchField}
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
