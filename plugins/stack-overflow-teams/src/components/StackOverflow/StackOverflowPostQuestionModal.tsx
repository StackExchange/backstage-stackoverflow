import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import Chip from '@material-ui/core/Chip'
import { stackoverflowteamsApiRef } from '../../api';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CodeIcon from '@mui/icons-material/Code';
import TitleIcon from '@mui/icons-material/Title';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { useStackOverflowStyles } from './hooks';
import { TiptapEditor } from './TiptapEditor';
import type { Tag } from '../../types'
import { CircularProgress } from '@mui/material';

// Utility function to detect Mac
const isMac = () => {
  return typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
};

// Apple keyboards are... different :)
const getModifierKey = () => {
  const isApple = isMac();
  return {
    symbol: isApple ? '⌘' : 'Ctrl',
    text: isApple ? 'Cmd' : 'Ctrl'
  };
};

export const StackOverflowPostQuestionModal = () => {
  const stackOverflowApi = useApi(stackoverflowteamsApiRef);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState(''); // This will now contain HTML from TiptapEditor
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  // Mentioning users is not supported on the API (yet)
  // const [mentionedUsers, setMentionedUsers] = useState<string[]>([]); 
  // const [userInput, setUserInput] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [titleValidation, setTitleValidation] = useState('');
  const [bodyValidation, setBodyValidation] = useState('');
  const [tagsValidation, setTagsValidation] = useState('');
  const classes = useStackOverflowStyles();
  const [titleStarted, setTitleStarted] = useState(false);
  const [bodyStarted, setBodyStarted] = useState(false);
  const [tagsStarted, setTagsStarted] = useState(false);

  // Get popular tags
  const [popularTags, setPopularTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)

  const fetchPopularTags = useCallback(async function () {
    if (!isAuthenticated) return;

    setLoadingTags(true);
    setTagError(null);

    try {
      const response = await stackOverflowApi.getTags();
      const topTags = response.items?.slice(0, 10) || [];
      setPopularTags(topTags);
    } catch (err) {
      setTagError('Failed to load tags.')
      setPopularTags([])
    } finally {
      setLoadingTags(false);
    }
  }, [stackOverflowApi, isAuthenticated])
  
  // Get modifier key info
  const modifierKey = getModifierKey();
  
  function validateTitle(value: string) {
    if (titleStarted && value.trim().length < 15) {
      setTitleValidation('Title should be at least 15 characters for clarity.');
    } else {
      setTitleValidation('');
    }
  }
  
  const validateBody = useCallback(function validateBody(value: string) {
    // Strip HTML tags for character count validation
    const textContent = value.replace(/<[^>]*>/g, '');
    if (bodyStarted && textContent.trim().length < 30) {
      setBodyValidation('Please provide more detail (minimum 30 characters).');
    } else {
      setBodyValidation('');
    }
  }, [bodyStarted])
  
  const validateTags = useCallback (function validateTags() {
    if (tagsStarted && tags.length === 0) {
      setTagsValidation('At least one tag is required.');
    } else {
      setTagsValidation('');
    }
  }, [tagsStarted, tags])
  
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
  
  useEffect(() => {
    if (open && isAuthenticated && popularTags.length === 0) {
      fetchPopularTags();
    }
  }, [open, isAuthenticated, fetchPopularTags, popularTags.length]);

  useEffect(() => {
    validateTags();
  }, [tags, tagsStarted, validateTags]);
  
  useEffect(() => {
    validateBody(body);
  }, [body, bodyStarted, validateBody]);
  
  const handleSubmit = async () => {
    validateTitle(title);
    validateBody(body);
    validateTags();
    if (titleValidation || bodyValidation || tagsValidation) {
      return;
    }
    // Check if body has actual content (not just HTML tags)
    const textContent = body.replace(/<[^>]*>/g, '').trim();
    if (!title || !textContent || tags.length === 0) {
      setError('Title, body, and at least one tag are required.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await stackOverflowApi.postQuestion(title, body, tags);
      setSuccess(true);
      // We reset everything
      setTitle('');
      setBody('');
      setTags([]);
      setTagInput('');
      // setMentionedUsers([]);
      // setUserInput('');
      if (response.webUrl) {
        window.open(`${response.webUrl}?r=Backstage_Plugin`, '_blank');
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
    const newTags = tagInput
      .split(/[\s,]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && !tags.includes(tag));
  
    if (newTags.length > 0 && tags.length + newTags.length <= 5) {
      setTags([...tags, ...newTags]);
      if (!tagsStarted) setTagsStarted(true);
    }
    setTagInput('');
  };
  
  // This can be uncommented in future once mentioning users over API v3 is supported

  // const handleUserAdd = () => {
  //   const newUsers = userInput
  //     .split(/[\s,]+/)
  //     .map(user => user.trim().replace('@', ''))
  //     .filter(user => user.length > 0 && !mentionedUsers.includes(user));
  
  //   if (newUsers.length > 0) {
  //     setMentionedUsers([...mentionedUsers, ...newUsers]);
  //   }
  //   setUserInput('');
  // };
  
  const handleLoginRedirect = () => {
    setOpen(false);
    window.location.href = '/stack-overflow-teams';
  };
  
  // Handler for TiptapEditor changes
  const handleBodyChange = (value: string) => {
    if (!bodyStarted) setBodyStarted(true);
    setBody(value);
  };
  
  const handleBodyFocus = () => {
    setFocusedField('body');
  };
  
  const renderTitleTips = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TitleIcon color="primary" />
        Writing a Good Title
      </Typography>
      
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CheckCircleIcon color="success" fontSize="small" />
            Good Title Examples
          </Typography>
          <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'success.50', mb: 1 }}>
            <Typography variant="body2" color="success.main">
              ✓ "How to handle async errors in React useEffect hook?"
            </Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'success.50', mb: 1 }}>
            <Typography variant="body2" color="success.main">
              ✓ "Why does my Docker container fail to connect to PostgreSQL?"
            </Typography>
          </Paper>
          <Paper elevation={1} sx={{ p: 1.5, bgcolor: 'error.50' }}>
            <Typography variant="body2" color="error.main">
              ✗ "Help! My code doesn't work!"
            </Typography>
          </Paper>
        </CardContent>
      </Card>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Title Tips
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Be specific about your problem" />
            </ListItem>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Include relevant technologies" />
            </ListItem>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Avoid vague terms like 'doesn't work'" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderBodyTips = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DescriptionIcon color="primary" />
        Writing a Good Description
      </Typography>
      
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CodeIcon color="info" fontSize="small" />
            Rich Text Formatting
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Use the toolbar to format your text with bold, italic, code blocks, lists, and more. Keyboard shortcuts: {modifierKey.text}+B (bold), {modifierKey.text}+I (italic), {modifierKey.text}+U (underline), {modifierKey.text}+E (code).
          </Typography>
        </CardContent>
      </Card>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Structure Your Question
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="What you're trying to achieve" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="What you've tried so far" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Expected vs actual results" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Error messages (if any)" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderTagsTips = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LocalOfferIcon color="primary" />
        Choosing Tags
      </Typography>
      
      <Card elevation={2} sx={{ mb: 2 }}>
                <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ pb: 1 }}>
            Popular Tags
          </Typography>
          
          {loadingTags && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading popular tags...
              </Typography>
            </Box>
          )}
          {!loadingTags && tagError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {tagError}
            </Typography>
          )}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {popularTags.map(tag => (
              <Chip
                key={tag.name}
                label={`${tag.name}`}
                size="medium"
                variant="outlined"
                onClick={() => !tags.includes(tag.name) && tags.length < 5 && setTags([...tags, tag.name])}
                disabled={tags.includes(tag.name) || tags.length >= 5}
              />
            ))}
          </Box>
          {!loadingTags && !tagError && popularTags.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Click on any popular tag above to add them quickly.
            </Typography>
          )}
          {!loadingTags && !tagError && popularTags.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No popular tags available.
            </Typography>
          )}
        </CardContent>
      </Card>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Tag Guidelines
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Use 1-5 tags that describe your question" />
            </ListItem>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Try to use existing tags" />
            </ListItem>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Add relevant tools and platforms" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderMentionTips = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <GroupIcon color="primary" />
        Asking Team Members
      </Typography>
      
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon color="info" fontSize="small" />
            When to Mention Someone
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="They're an expert in the relevant area" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="They've worked on similar problems" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="They're the owner of the code in question" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
      <Card elevation={2}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Mention Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Type usernames or group names. You can mention:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Individual team members (@john.doe)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><InfoIcon color="info" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Team groups (@frontend-team)" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderDefaultTips = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <LightbulbIcon color="primary" />
        Writing a Good Question
      </Typography>
      
      <Card elevation={2} sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <InfoIcon color="info" fontSize="small" />
            Quick Tips
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Be specific and clear in your title" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Include relevant code and error messages" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Tag your question appropriately" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircleIcon color="success" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Mention relevant team members if needed" />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderRightPanel = () => {
    switch (focusedField) {
      case 'title':
        return renderTitleTips();
      case 'body':
        return renderBodyTips();
      case 'tags':
        return renderTagsTips();
      case 'mentions':
        return renderMentionTips();
      default:
        return renderDefaultTips();
    }
  };
  
  const renderQuestionForm = () => (
    <Box sx={{ height: '100%' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Title
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Be specific and imagine you're asking a question to another person.
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={title}
          onChange={e => {
            if (!titleStarted) setTitleStarted(true);
            setTitle(e.target.value);
            validateTitle(e.target.value);
          }}
          onFocus={() => setFocusedField('title')}
          error={titleStarted && !!titleValidation}
          helperText={titleStarted ? titleValidation : ''}
          placeholder="e.g., How to handle authentication in React components?"
        />
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          What are the details of your problem?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Introduce the problem and expand on what you put in the title. Use the formatting toolbar to style your text.
        </Typography>
        <TiptapEditor
          content={body}
          onUpdate={handleBodyChange}
          onFocus={handleBodyFocus}
          placeholder="Describe your problem in detail. Include any error messages, code snippets, and what you've tried so far..."
          error={bodyStarted && !!bodyValidation}
          modifierKey={modifierKey}
        />
        {bodyStarted && bodyValidation && (
          <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
            {bodyValidation}
          </Typography>
        )}
      </Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Tags
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Add a minimum of one tag
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={tagInput}
          onChange={e => {
            setTagInput(e.target.value);
            if (e.target.value.includes(',') || e.target.value.includes(' ')) {
              handleTagAdd();
            }
          }}
          onFocus={() => setFocusedField('tags')}
          onKeyDown={e => e.key === 'Enter' && handleTagAdd()}
          placeholder="e.g., react, javascript, authentication"
          error={!!tagsValidation}
        />
        
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => setTags(tags.filter(t => t !== tag))}
                size="medium"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        )}
      </Box>
      {/* This is the UI for mentioning users (not yet supported on v3) */}
       {/* <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Ask Team Members (Optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Mention specific team members or groups who might help with your question.
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={userInput}
          onChange={e => {
            setUserInput(e.target.value);
            if (e.target.value.includes(',') || e.target.value.includes(' ')) {
              handleUserAdd();
            }
          }}
          onFocus={() => setFocusedField('mentions')}
          onKeyDown={e => e.key === 'Enter' && handleUserAdd()}
          placeholder="e.g., @john.doe, @frontend-team"
        />
        
        {mentionedUsers.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {mentionedUsers.map((user, index) => (
              <Chip
                key={index}
                label={`@${user}`}
                onDelete={() => setMentionedUsers(mentionedUsers.filter(u => u !== user))}
                size="medium"
                variant="outlined"
                color="secondary"
              />
            ))}
          </Box>
        )}
      </Box> 
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )} */}
      
      <Box mt={3} sx={{ borderTop: 1, borderColor: 'divider', pt: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          className={classes.button}
          size="large"
          onClick={handleSubmit}
          disabled={loading || !isAuthenticated}
          sx={{ flex: 2 }}
        >
          {loading ? 'Posting Question...' : 'Post Your Question'}
        </Button>
        <Button onClick={() => setOpen(false)} variant="outlined" size="large" sx={{ flex: 1 }}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
  
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" variant="h6">
            Authentication Required
          </Typography>
          <Typography sx={{ mt: 1, mb: 2 }}>
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
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Alert severity="success">
            <AlertTitle>Question Posted Successfully!</AlertTitle>
            Your question has been posted and will open in a new tab.
          </Alert>
        </Box>
      );
    }
    return (
      <Grid container spacing={4} sx={{ height: '100%' }}>
        <Grid item xs={12} md={8}>
          {renderQuestionForm()}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRightPanel()}
        </Grid>
      </Grid>
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
          width: { xs: '95vw', sm: '90vw', md: '80vw', lg: '65vw' },
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, maxHeight: '90vh', overflow: 'auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" className={classes.title} fontWeight="bold">
              Ask a question on Stack Overflow for Teams
            </Typography>
            <Button onClick={() => setOpen(false)} color="inherit" sx={{ minWidth: 'auto', p: 1 }}>
              ✕
            </Button>
          </Box>
          
          {renderContent()}
        </Box>
      </Box>
    </Modal>
  );
};