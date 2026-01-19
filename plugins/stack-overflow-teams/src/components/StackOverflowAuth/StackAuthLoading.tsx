// eslint-disable-next-line no-restricted-imports
import { Box, Typography, CircularProgress } from '@mui/material';

export const StackAuthLoading = () => {

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh" // Center vertically and horizontally
    >
      <CircularProgress sx={{ color:' #F48024' }} />
      <Typography variant="h6" mt={2} >
        Authenticating...
      </Typography>
    </Box>
  );
};