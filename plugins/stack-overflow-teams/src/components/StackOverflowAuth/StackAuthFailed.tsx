import React from 'react';
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
      <Typography variant="body1" mt={1} sx={{ color: 'textSecondary' }}>
        Something went wrong. Please try again.
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