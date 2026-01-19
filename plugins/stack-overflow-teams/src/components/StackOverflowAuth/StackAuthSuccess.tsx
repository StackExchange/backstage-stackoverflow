// eslint-disable-next-line no-restricted-imports
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
      <Box mt={2}>
      <Typography variant="h5" >
        You have successfully logged in with Stack Overflow Internal!
      </Typography>
      </Box>
      <Box mt={1}>
      <Typography variant="body1" >
        You can now access all Stack Overflow Internal features from Backstage
      </Typography>
      </Box>
      <Box mt={2}>
      <Button
        variant="contained"
        className={classes.button}
        onClick={() => navigate('/stack-overflow-teams')}
      >
        Return to Stack Internal
      </Button>
      </Box>
    </Box>
  );
};
