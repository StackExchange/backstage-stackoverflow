import React from 'react';
import { Link, Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import {
  Chip,
  Grid,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Paper,
  Avatar,
} from '@material-ui/core';
import { User } from '../../api';
import SearchIcon from '@material-ui/icons/Search';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  userCard: {
    padding: theme.spacing(2),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s',
    '&:hover': {
      boxShadow: theme.shadows[4],
    },
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(1),
  },
  cardContent: {
    flex: 1,
    minHeight: 60, // Ensures consistent content height
  },
  reputation: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    fontSize: '0.9rem',
    marginLeft: 'auto',
    whiteSpace: 'nowrap',
  },
  roleChip: {
    position: 'absolute',
    bottom: theme.spacing(1),
    right: theme.spacing(1),
    fontWeight: 'bold',
    fontSize: '0.7rem',
  },
  avatar: {
    width: 48,
    height: 48,
    marginRight: theme.spacing(1.5),
  },
  userLink: {
    color: '#0077cc',
    '&:hover': {
      color: '#0095ff',
    },
  },
}));

const UserCard = ({ user }: { user: User }) => {
  const classes = useStyles();
  const isModerator = user.role === 'Moderator';
  const isAdmin = user.role === 'Admin';

  return (
    <Paper className={classes.userCard} elevation={0}>
      <div className={classes.cardHeader}>
        <Avatar
          src={user.avatarUrl}
          alt={user.name}
          className={classes.avatar}
        />
        <Box flex={1}>
          <Typography
            variant="subtitle1"
            component="a"
            href={user.webUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {user.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.jobTitle || 'Developer'}
          </Typography>
          {user.department && (
          <Typography variant="body2" color="textSecondary" noWrap>
            {user.department}
          </Typography>
        )}
        </Box>
        <Typography className={classes.reputation}>
          {user.reputation} rep
        </Typography>
      </div>


      {(isModerator || isAdmin) && (
        <Chip
          label={isModerator ? 'Moderator' : 'Admin'}
          size="small"
          className={classes.roleChip}
          style={{
            backgroundColor: isModerator ? '#fff4d1' : '#f8d7da',
            color: isModerator ? '#725b02' : '#842029',
          }}
        />
      )}
    </Paper>
  );
};

const StackOverflowUserList = ({
  users,
  searchTerm,
}: {
  users: User[];
  searchTerm: string;
}) => {
  if (users.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <Typography variant="body1" gutterBottom>
          No users found matching "{searchTerm}"
        </Typography>
        <Link
          to={`https://stackoverflow.com/users?query=${encodeURIComponent(
            searchTerm,
          )}`}
        >
          Search Stack Overflow users
        </Link>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {users.map(user => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={user.name}>
          <UserCard user={user} />
        </Grid>
      ))}
    </Grid>
  );
};

export const StackOverflowUsers = () => {
  const { data, loading, error } = useStackOverflowData('users');
  const [searchTerm, setSearchTerm] = React.useState('');

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
    <div>
      <Box mb={3}>
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
            style: {
              borderRadius: 40,
              paddingLeft: 16,
              paddingRight: 16,
            },
          }}
        />
      </Box>

      <StackOverflowUserList users={filteredUsers} searchTerm={searchTerm} />
    </div>
  );
};

export default StackOverflowUsers;