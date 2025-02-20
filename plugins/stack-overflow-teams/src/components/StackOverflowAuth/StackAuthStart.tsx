import React, { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
import { Button, Typography, Box, CircularProgress } from '@mui/material';

export const StackOverflowAuthStart = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await stackOverflowTeamsApi.getAuthStatus(); //
        setIsAuthenticated(isLoggedIn);
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const handleAuth = async () => {
    try {
      const authUrl = await stackOverflowTeamsApi.startAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error starting OAuth:', error);
    }
  };

  if (isAuthenticated === null) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Checking authentication...</Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <Typography variant="h5" color="primary">You're already logged in!</Typography>
        <Typography variant="body1" mt={1}>You can access Stack Overflow features.</Typography>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
      <Typography variant="h5">Stack Overflow Login</Typography>
      <Typography variant="body1" mt={1}>
        Click the button below to log in with your Stack Overflow account.
      </Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleAuth}>
        Login with Stack Overflow
      </Button>
    </Box>
  );
};
