import React, { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
import { Button, Typography, Box } from '@mui/material';
import { StackAuthSuccess } from './StackAuthSuccess';
import { useStackOverflowStyles } from '../StackOverflow/hooks'; // Import the styles hook
import { StackOverflowIcon } from '../../icons';

// isAuthenticated is checked on the StackOverflowTeamsPage component.

export const StackOverflowAuthStart = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const classes = useStackOverflowStyles(); // Use the styles hook

  const handleAuth = async () => {
    try {
      const authUrl = await stackOverflowTeamsApi.startAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error starting OAuth:', error);
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
      <Typography variant="body1" color="textSecondary" mt={1}>
        Click the button below to log in with your Stack Overflow for Teams
        account.
      </Typography>
      <Button
        variant="contained"
        className={classes.button}
        sx={{ mt: 2 }}
        onClick={handleAuth}
      >
        Login with Stack Overflow
      </Button>
    </Box>
  );
};
