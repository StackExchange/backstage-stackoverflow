import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useStackOverflowStyles } from '../StackOverflow/hooks';
import { StackOverflowIcon } from '../../icons';

export const StackOverflowAuthStart = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const classes = useStackOverflowStyles();
  const [authError, setAuthError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tokenSuccess, setTokenSuccess] = useState<boolean>(false);
  const [teamName, setTeamName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTeamName = async () => {
      try {
        setIsLoading(true);
        const teamNameValue = await stackOverflowTeamsApi.getTeamName();
        setTeamName(teamNameValue);
      } catch (error) {
        setAuthError('Failed to fetch Stack Overflow Internal instance information.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamName();
  }, [stackOverflowTeamsApi]);

  // Determine if user is on basic or business plan based on the teamName
  const isBasicOrBusinessPlan = Boolean(teamName)

  const handleAuth = async () => {
    try {
      setAuthError(null); // Clear previous errors when retrying
      const authUrl = await stackOverflowTeamsApi.startAuth();
      window.location.href = authUrl;
    } catch (error) {
      setAuthError(
        'Something went wrong during authentication. Please try again.',
      );
    }
  };

  const handleTokenSubmit = async () => {
    if (!accessToken.trim()) {
      setAuthError('Access token cannot be empty');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const success = await stackOverflowTeamsApi.submitAccessToken(
        accessToken,
      );

      if (success) {
        setTokenSuccess(true);
        setAccessToken('');
        window.location.reload();
      } else {
        setAuthError(
          'Failed to validate token. Please check your token and try again.',
        );
      }
    } catch (error) {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <Typography variant="body1">Loading Stack Overflow Internal configuration...</Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      bgcolor="background.default"
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <StackOverflowIcon />
        <Typography variant="h5" gutterBottom>
          Stack Internal
        </Typography>

        {/* Standard OAuth login - only displayed if NOT on basic/business plan */}
        {!isBasicOrBusinessPlan && (
          <Box width="100%" mb={3}>
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              gutterBottom
            >
              Connect with your Stack Internal Enterprise account
            </Typography>

            <Box mt={2} display="flex" justifyContent="center">
              <Button
                variant="contained"
                className={classes.button}
                onClick={handleAuth}
                disabled={isSubmitting}
                fullWidth
              >
                Login with Stack Overflow Internal
              </Button>
            </Box>
          </Box>
        )}

        {/* Manual PAT token input for basic/business plans */}
        {isBasicOrBusinessPlan && (
          <Box width="100%">
            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              gutterBottom
            >
              Enter your Personal Access Token (PAT)
            </Typography>

            <Typography
              variant="body2"
              color="textSecondary"
              align="center"
              gutterBottom
            >
              <Link
                href="https://stackoverflowteams.help/en/articles/10908790-personal-access-tokens-pats-for-api-authentication"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
              >
                Learn how to generate a Personal Access Token
              </Link>
            </Typography>

            <TextField
              fullWidth
              label="Personal Access Token"
              variant="outlined"
              margin="normal"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              type={showToken ? 'text' : 'password'}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle token visibility"
                      onClick={() => setShowToken(!showToken)}
                      edge="end"
                    >
                      {showToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleTokenSubmit}
                disabled={isSubmitting || !accessToken.trim()}
                className={classes.button}
              >
                {isSubmitting ? 'Validating...' : 'Submit Token'}
              </Button>
            </Box>
          </Box>
        )}
        {authError && (
          <Typography
            variant="body2"
            color="error"
            sx={{ maxWidth: '100%', textAlign: 'center', mt: 2 }}
          >
            {authError}
          </Typography>
        )}
      </Paper>

      <Snackbar
        open={tokenSuccess}
        autoHideDuration={6000}
        onClose={() => setTokenSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Stack Overflow Internal token accepted successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
};