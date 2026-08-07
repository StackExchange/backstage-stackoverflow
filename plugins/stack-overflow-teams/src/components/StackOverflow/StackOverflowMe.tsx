import React, { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  Link,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import LaunchIcon from '@material-ui/icons/Launch';
import PersonIcon from '@material-ui/icons/Person';
import { stackoverflowteamsApiRef, User } from '../../api';
import { LogoutIcon } from '../../icons';

const useStyles = makeStyles((theme: Theme) => ({
  profile: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: 180,
    textAlign: 'center',
  },
  logout: {
    position: 'absolute',
    top: -8,
    right: -8,
    color: theme.palette.text.secondary,
  },
  avatar: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing(1.5),
    backgroundColor: theme.palette.type === 'dark' ? '#4A2B18' : '#FFF0E4',
    color: theme.palette.type === 'dark' ? '#FFC79D' : '#9A4100',
  },
  name: {
    maxWidth: '100%',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  jobTitle: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  details: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(1.5),
  },
  reputation: {
    color: theme.palette.type === 'dark' ? '#FFD2B0' : '#7A3300',
    backgroundColor: theme.palette.type === 'dark' ? '#422615' : '#FFF0E4',
    fontWeight: 700,
  },
  profileLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    marginTop: theme.spacing(2),
    fontWeight: 700,
    textUnderlineOffset: 3,
  },
  state: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 160,
    width: '100%',
    textAlign: 'center',
  },
}));

export const StackOverflowMe: React.FC = () => {
  const classes = useStyles();
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await stackOverflowTeamsApi.getMe();
        setUserData(data);
      } catch (err) {
        setError('We couldn’t load your profile. Try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [stackOverflowTeamsApi]);

  const logout = async () => {
    try {
      setError(null);
      const success = await stackOverflowTeamsApi.logout();
      if (!success) {
        setError('We couldn’t sign you out. Please try again.');
        return;
      }
      window.location.reload();
    } catch (err) {
      setError('We couldn’t sign you out. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box className={classes.state} aria-label="Loading your profile">
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={classes.state}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box className={classes.state}>
        <Typography color="textSecondary">No profile is available.</Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.profile}>
      <Tooltip title="Sign out of Stack Internal" arrow>
        <IconButton
          size="small"
          onClick={logout}
          className={classes.logout}
          aria-label="Sign out of Stack Internal"
        >
          <LogoutIcon />
        </IconButton>
      </Tooltip>

      <Avatar src={userData.avatarUrl} alt="" className={classes.avatar}>
        <PersonIcon />
      </Avatar>
      <Typography variant="h6" className={classes.name}>
        {userData.name}
      </Typography>
      {userData.jobTitle && (
        <Typography variant="body2" className={classes.jobTitle}>
          {userData.jobTitle}
        </Typography>
      )}

      <Box className={classes.details}>
        <Chip
          label={`${userData.reputation.toLocaleString()} reputation`}
          size="small"
          className={classes.reputation}
        />
        {userData.role && (
          <Chip label={userData.role} size="small" variant="outlined" />
        )}
      </Box>

      <Link
        href={userData.webUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={classes.profileLink}
      >
        View Stack Internal profile
        <LaunchIcon fontSize="small" aria-hidden="true" />
      </Link>
    </Box>
  );
};
