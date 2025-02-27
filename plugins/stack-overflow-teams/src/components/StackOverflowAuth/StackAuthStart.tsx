import React, { useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
// eslint-disable-next-line no-restricted-imports
import { Button, Typography, Box } from '@mui/material';
import { useStackOverflowStyles } from '../StackOverflow/hooks'; // Import the styles hook
import { StackOverflowIcon } from '../../icons';

export const StackOverflowAuthStart = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const classes = useStackOverflowStyles();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleAuth = async () => {
    try {
      setAuthError(null); // Clear previous errors when retrying
      const authUrl = await stackOverflowTeamsApi.startAuth();
      window.location.href = authUrl;
    } catch (error) {
      setAuthError('Something went wrong during authentication. Please try again.');
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="background.default"
    >
      <StackOverflowIcon />
      <Typography variant="h6">Stack Overflow for Teams Login</Typography>
      <Box mt={1}>
      <Typography variant="body1" color="textSecondary" >
        Click the button below to log in with your Stack Overflow for Teams
        account.
      </Typography>
      </Box>
      <Box mt={2}>
      <Button
        variant="contained"
        className={classes.button}
        onClick={handleAuth}
      >
        Login with Stack Overflow
      </Button>
      </Box>

      {authError && (
        <Typography 
          variant="body2" 
          color="error" 
          mt={2}
          sx={{ maxWidth: '300px', textAlign: 'center' }}
        >
          {authError}
        </Typography>
      )}
    </Box>
  );
};