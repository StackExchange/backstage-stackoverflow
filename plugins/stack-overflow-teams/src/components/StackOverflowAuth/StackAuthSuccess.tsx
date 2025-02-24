import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { StackOverflowIcon } from '../../icons';
import { useStackOverflowStyles } from '../StackOverflow/hooks';
import { useNavigate } from 'react-router-dom'

export const StackAuthSuccess = () => {
  const classes = useStackOverflowStyles();
  const navigate = useNavigate();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
    >
      <StackOverflowIcon />
      <Typography variant="h5" mt={2}>
        You have successfully logged in with Stack Overflow!
      </Typography>
      <Typography variant="body1" mt={1}>
        You can now access all Stack Overflow features from Backstage
      </Typography>
      <Button
        variant="contained"
        className={classes.button}
        sx={{ mt: 2 }}
        onClick={() => navigate('/stack-overflow-teams')}
      >
        Return to Stack Overflow for Teams
      </Button>
    </Box>
  );
};
