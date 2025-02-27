import React, { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
// eslint-disable-next-line no-restricted-imports
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Link,
} from '@mui/material';
import { useStackOverflowStyles } from './hooks';
import { useNavigate } from 'react-router-dom';

export const StackOverflowPostQuestionModal = () => {
  const stackOverflowApi = useApi(stackoverflowteamsApiRef);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [titleValidation, setTitleValidation] = useState('');
  const [bodyValidation, setBodyValidation] = useState('');
  const classes = useStackOverflowStyles(); // Use the styles hook
  const navigate = useNavigate(); // Hook for navigation

  const [titleStarted, setTitleStarted] = useState(false);
  const [bodyStarted, setBodyStarted] = useState(false);

  function validateTitle(value: string) {
    if (titleStarted && value.trim().length < 5) {
      setTitleValidation('Title must be at least 5 characters.');
    } else {
      setTitleValidation('');
    }
  }

  function validateBody(value: string) {
    if (bodyStarted && value.trim().length < 5) {
      setBodyValidation('Body must be at least 5 characters.');
    } else {
      setBodyValidation('');
    }
  }

  useEffect(() => {
    const openModal = async () => {
      const authStatus = await stackOverflowApi.getAuthStatus();
      setIsAuthenticated(authStatus);
      setSuccess(false);

      setOpen(true);
    };
    window.addEventListener('openAskQuestionModal', openModal);

    return () => {
      window.removeEventListener('openAskQuestionModal', openModal);
    };
  }, [stackOverflowApi]);

  const handleSubmit = async () => {
    validateTitle(title);
    validateBody(body);

    if (titleValidation || bodyValidation) {
      return;
    }

    if (!title || !body || tags.length === 0) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await stackOverflowApi.postQuestion(title, body, tags);
      setSuccess(true);
      setTitle('');
      setBody('');
      setTags([]);
      setTagInput('');
      if (response.webUrl) {
        window.open(response.webUrl, '_blank');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleLoginRedirect = () => {
    setOpen(false);
    navigate('/stack-overflow-teams');
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <Box mt={1}>
        <Typography color="error">
          Please{' '}
          <Link component="button" onClick={handleLoginRedirect}>
            log in
          </Link>{' '}
          to use this feature.
        </Typography>
        </Box>
      );
    }

    if (success) {
      return (
        <Typography color="success.main">
          Your question has been posted successfully!
        </Typography>
      );
    }

    return (
      <>
        <TextField
          label="Title"
          fullWidth
          variant="outlined"
          margin="normal"
          value={title}
          onChange={e => {
            if (!titleStarted) setTitleStarted(true);
            setTitle(e.target.value);
            validateTitle(e.target.value);
          }}
          error={titleStarted && !!titleValidation}
          helperText={titleStarted ? titleValidation : ''}
        />

        <TextField
          label="Body"
          fullWidth
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={body}
          onChange={e => {
            if (!bodyStarted) setBodyStarted(true);
            setBody(e.target.value);
            validateBody(e.target.value);
          }}
          error={bodyStarted && !!bodyValidation}
          helperText={bodyStarted ? bodyValidation : ''}
        />

        <TextField
          label="Tags"
          fullWidth
          variant="outlined"
          margin="normal"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTagAdd()}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => setTags(tags.filter(t => t !== tag))}
            />
          ))}
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <Box mt={2}>
          <Button
            variant="contained"
            className={classes.button} // Apply Stack Overflow button styles
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Posting...' : 'Post Question'}
          </Button>
        </Box>
      </>
    );
  };

  return (
    <Modal open={open} onClose={() => setOpen(false)}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2} className={classes.title}>
          Ask a Stack Overflow Question
        </Typography>
        {renderContent()}
        <Box mt={2}>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Box>
      </Box>
    </Modal>
  );
};
