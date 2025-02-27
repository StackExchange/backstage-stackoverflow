import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { Box, Typography, Button } from '@mui/material';
import { useStackOverflowStyles } from '../StackOverflow/hooks'; 
import { useNavigate } from 'react-router-dom'; 

export const StackAuthFailed = () => {
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
      <Typography variant="h5" sx={{ color: '#FF6B6B' }}> 
        Authentication Failed
      </Typography>
      <Box mt={1}>
      <Typography variant="body1"  sx={{ color: 'textSecondary' }}>
        Something went wrong. Please try again.
      </Typography>
      </Box>
      <Box mt={1}>
      <Button
        variant="contained"
        className={classes.button} 
       
        onClick={() => navigate('/stack-overflow-teams')} 
      >
        Return to Stack Overflow for Teams
      </Button>
      </Box>
    </Box>
  );
};