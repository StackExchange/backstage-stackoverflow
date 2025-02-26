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
import { useStackOverflowStyles } from './hooks'; // Import the styles hook
import { useNavigate } from 'react-router-dom'; // For navigation

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
  const classes = useStackOverflowStyles(); // Use the styles hook
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const openModal = async () => {
      const authStatus = await stackOverflowApi.getAuthStatus();
      setIsAuthenticated(authStatus);

      setOpen(true);
    };
    window.addEventListener('openAskQuestionModal', openModal);

    return () => {
      window.removeEventListener('openAskQuestionModal', openModal);
    };
  }, [stackOverflowApi]);

  const handleSubmit = async () => {
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
      setError('Failed to post question. Please try again.');
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
        <Typography color="error">
          Please{' '}
          <Link component="button" onClick={handleLoginRedirect}>
            log in
          </Link>{' '}
          to use this feature.
        </Typography>
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
          onChange={(e) => setTitle(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <TextField
          label="Body"
          fullWidth
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <TextField
          label="Tags"
          fullWidth
          variant="outlined"
          margin="normal"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              onDelete={() => setTags(tags.filter((t) => t !== tag))}
            />
          ))}
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <Button
          variant="contained"
          className={classes.button} // Apply Stack Overflow button styles
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? 'Posting...' : 'Post Question'}
        </Button>
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
        <Button onClick={() => setOpen(false)} sx={{ mt: 2 }}>
          Close
        </Button>
      </Box>
    </Modal>
  );
};