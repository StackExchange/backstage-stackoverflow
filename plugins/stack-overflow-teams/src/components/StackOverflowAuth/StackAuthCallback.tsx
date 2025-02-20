import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Typography, Button, Box } from '@mui/material';

export const StackOverflowCallback = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const location = useLocation();
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');

      if (!code || !state) {
        console.error('OAuth code or state not found in URL');
        setStatus('error');
        return;
      }

      try {
        await stackOverflowTeamsApi.completeAuth(code, state);
        setStatus('success');
        window.history.replaceState({}, document.title, location.pathname);
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
      }
    };

    handleCallback();
  }, [location.search, stackOverflowTeamsApi]);

  if (status === 'loading') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>Authenticating...</Typography>
      </Box>
    );
  }

  if (status === 'success') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
        <Typography variant="h5" color="primary">Authentication Successful!</Typography>
        <Typography variant="body1" mt={1}>You can now use Stack Overflow features in Backstage.</Typography>
        <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Go to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
      <Typography variant="h5" color="error">Authentication Failed</Typography>
      <Typography variant="body1" mt={1}>Something went wrong. Please try again.</Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate('/')}>
        Return Home
      </Button>
    </Box>
  );
};
