import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef, User } from '../../api';
import { useEffect, useState } from 'react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  Box,
  Avatar,
  Typography,
  Card,
  CardContent,
  Link,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { LogoutIcon } from '../../icons';

export const StackOverflowMe = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const logout = async () => {
    try {
      const success = await stackOverflowTeamsApi.logout();
      if (success) {
        window.location.reload();
      } else {
        throw new Error('Logout failed.');
      }
    } catch (error:any) {
      throw new Error('Error during logout:', error);
    }
  };

  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const data = await stackOverflowTeamsApi.getMe();
        setUserData(data);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [stackOverflowTeamsApi]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!userData) return null;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
    >
      <Card
        variant="outlined"
        sx={{
          p: 3,
          position: 'relative',
          boxShadow: 3,
        }}
      >
        {/* Logout Button */}
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, color: '#f48024' }}
          onClick={logout}
        >
          <LogoutIcon />
        </IconButton>

        <CardContent sx={{ textAlign: 'center' }}>
          {/* Avatar */}
          <Avatar src={userData.avatarUrl} sx={{ mx: 'auto', mb: 2 }} />

          {/* User Details */}
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {userData.name}
          </Typography>

          <Box display="flex" justifyContent="center" gap={1} mb={1}>
            <Chip
              label={`Reputation: ${userData.reputation}`}
              size="small"
              color="primary"
            />
            <Chip label={userData.role} size="small" variant="outlined" />
          </Box>

          {userData.jobTitle && (
            <Typography variant="body2" fontWeight="500" mt={1}>
              Position: {userData.jobTitle}
            </Typography>
          )}

          {/* Profile Link */}
          <Link
            href={userData.webUrl}
            target="_blank"
            rel="noopener"
            color="primary"
            sx={{ display: 'block', mt: 2, fontWeight: 'bold' }}
          >
            View Profile
          </Link>
        </CardContent>
      </Card>
    </Box>
  );
};
