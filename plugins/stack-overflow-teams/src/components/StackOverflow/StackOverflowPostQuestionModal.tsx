import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import Chip from '@mui/material/Chip';
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
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useStackOverflowStyles } from './hooks';
import { TiptapEditor } from './TiptapEditor';
import type { Tag } from '../../types'
import CircularProgress from '@mui/material/CircularProgress';
import { debounce } from '@material-ui/core';
import Divider from '@mui/material/Divider';

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
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
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
  
  const [popularTags, setPopularTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [tagError, setTagError] = useState<string | null>(null)
  
  const [tagSearchResults, setTagSearchResults] = useState<Tag[]>([]);
  const [searchingTags, setSearchingTags] = useState(false);
  const [showCreateTagOption, setShowCreateTagOption] = useState(false);
  
  const fetchPopularTags = useCallback(async function fetchPopularTags() {
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
  
  const searchTags = useMemo(
    () => debounce(async (searchTerm: string) => {
      if (!searchTerm.trim() || !isAuthenticated) {
        setTagSearchResults([]);
        setShowCreateTagOption(false);
        return;
      }
      setSearchingTags(true);
      try {
        const response = await stackOverflowApi.getTags(searchTerm.trim());
        const results = response.items || [];
        setTagSearchResults(results);
        setShowCreateTagOption(results.length === 0);
      } catch (err) {
        setTagSearchResults([]);
        setShowCreateTagOption(true);
      } finally {
        setSearchingTags(false);
      }
    }, 500),
    [stackOverflowApi, isAuthenticated]
  );
  
  const modifierKey = getModifierKey();
  
  function validateTitle(value: string) {
    if (titleStarted && value.trim().length < 15) {
      setTitleValidation('Title should be at least 15 characters for clarity.');
    } else {
      setTitleValidation('');
    }
  }
  
  const validateBody = useCallback(function validateBody(value: string) {
    const textContent = value.replace(/<[^>]*>/g, '');
    if (bodyStarted && textContent.trim().length < 30) {
      setBodyValidation('Please provide more detail (minimum 30 characters).');
    } else {
      setBodyValidation('');
    }
  }, [bodyStarted])
  
  const validateTags = useCallback(function validateTags() {
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
      
      setTitle('');
      setBody('');
      setTags([]);
      setTagInput('');
      
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
    setTagSearchResults([]);
  };
  
  const handleLoginRedirect = () => {
    setOpen(false);
    window.location.href = '/stack-overflow-teams';
  };
  
  const handleBodyChange = (value: string) => {
    if (!bodyStarted) setBodyStarted(true);
    setBody(value);
  };
  
  const handleBodyFocus = () => {
    setFocusedField('body');
  };
  
  const renderTitleTips = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <TitleIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Writing a Good Title
        </Typography>
      </Box>
      
      <Card elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'success.main' }}>
            ✓ Good Examples
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
              <Typography variant="body2">
                "How to handle async errors in React useEffect hook?"
              </Typography>
            </Paper>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
              <Typography variant="body2">
                "Why does my Docker container fail to connect to PostgreSQL?"
              </Typography>
            </Paper>
          </Box>
          
          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 2, mb: 1.5, color: 'error.main' }}>
            ✗ Avoid
          </Typography>
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'error.50', border: '1px solid', borderColor: 'error.200' }}>
            <Typography variant="body2">
              "Help! My code doesn't work!"
            </Typography>
          </Paper>
        </CardContent>
      </Card>
      
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Tips for Success
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Be specific about your problem"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Include relevant technologies"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Avoid vague terms like 'doesn't work'"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderBodyTips = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <DescriptionIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Detailed Explanation
        </Typography>
      </Box>
      
      <Card elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CodeIcon color="info" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              Rich Text Formatting
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Use the toolbar for bold, italic, code blocks, and lists. Shortcuts: {modifierKey.text}+B (bold), {modifierKey.text}+I (italic), {modifierKey.text}+U (underline), {modifierKey.text}+E (code).
          </Typography>
        </CardContent>
      </Card>
      
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Structure Your Question
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="What you're trying to achieve"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="What you've tried so far"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Expected vs actual results"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Error messages (if any)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderTagsTips = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LocalOfferIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Choosing Tags
        </Typography>
      </Box>
      
      {(loadingTags || popularTags.length > 0 || tagError) && (
        <Card elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ '&:last-child': { pb: 2 } }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
              Popular Tags
            </Typography>
            
            {loadingTags && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1 }} color="text.secondary">
                  Loading...
                </Typography>
              </Box>
            )}
            
            {!loadingTags && tagError && (
              <Typography variant="body2" color="error">
                {tagError}
              </Typography>
            )}
            
            {!loadingTags && !tagError && popularTags.length > 0 && (
              <>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {popularTags.map(tag => (
                    <Chip
                      key={tag.name}
                      label={tag.name}
                      size="small"
                      variant="outlined"
                      onClick={() => !tags.includes(tag.name) && tags.length < 5 && setTags([...tags, tag.name])}
                      disabled={tags.includes(tag.name) || tags.length >= 5}
                      sx={{ 
                        cursor: tags.includes(tag.name) || tags.length >= 5 ? 'default' : 'pointer',
                        '&:hover': {
                          bgcolor: tags.includes(tag.name) || tags.length >= 5 ? 'transparent' : 'action.hover'
                        }
                      }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                  Click to add popular tags quickly
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Tag Guidelines
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Use 1-5 tags that describe your question"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Try to use existing tags"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Add relevant tools and platforms"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderMentionTips = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <GroupIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Asking Team Members
        </Typography>
      </Box>
      
      <Card elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <PersonIcon color="info" fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600}>
              When to Mention Someone
            </Typography>
          </Box>
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="They're an expert in the relevant area"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="They've worked on similar problems"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="They're the owner of the code in question"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
      
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Mention Guidelines
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Type usernames or group names. You can mention:
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Individual team members (@john.doe)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <InfoIcon color="info" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Team groups (@frontend-team)"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
  
  const renderDefaultTips = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <LightbulbIcon color="primary" />
        <Typography variant="h6" fontWeight={600}>
          Writing a Good Question
        </Typography>
      </Box>
      
      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            Quick Tips
          </Typography>
          <List dense disablePadding>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Be specific and clear in your title"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Include relevant code and error messages"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem sx={{ py: 0.5, px: 0 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary="Tag your question appropriately"
                primaryTypographyProps={{ variant: 'body2' }}
              />
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
    <Box sx={{ m: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          Title
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
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
          size="small"
        />
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          What are the details of your problem?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Introduce the problem and expand on what you put in the title.
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
      
      <Box sx={{ mb: 3, position: 'relative' }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
          Tags
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          At least one tag is required.
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          value={tagInput}
          onChange={e => {
            const value = e.target.value;
            setTagInput(value);
            setShowCreateTagOption(false);
            
            const lastTag = value.split(/[\s,]/).pop()?.trim() || '';
            if (lastTag.length >= 2) {
              searchTags(lastTag);
            } else {
              setTagSearchResults([]);
            }
            
            if (value.includes(',') || value.includes(' ')) {
              handleTagAdd();
            }
          }}
          onFocus={() => setFocusedField('tags')}
          onKeyDown={e => e.key === 'Enter' && handleTagAdd()}
          placeholder="e.g., react, javascript, authentication"
          error={!!tagsValidation}
          size="small"
        />
        
        {(tagSearchResults.length > 0 || searchingTags || (tagInput.trim() && tagSearchResults.length === 0 && !searchingTags)) && (
          <Paper 
            elevation={3} 
            sx={{ 
              position: 'absolute', 
              zIndex: 1000, 
              width: '100%', 
              maxHeight: 200, 
              overflow: 'auto',
              mt: 0.5
            }}
          >
            {searchingTags && (
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">Searching tags...</Typography>
              </Box>
            )}
            {tagSearchResults.map(tag => (
              <ListItem 
                key={tag.name}
                onClick={() => {
                  if (!tags.includes(tag.name) && tags.length < 5) {
                    setTags([...tags, tag.name]);
                    if (!tagsStarted) setTagsStarted(true);
                  }
                  setTagInput('');
                  setTagSearchResults([]);
                }}
                sx={{ 
                  cursor: 'pointer',
                  py: 1,
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <ListItemText 
                  primary={tag.name}
                  secondary={`${tag.postCount} posts`}
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
            {tagInput.trim() && showCreateTagOption && (
              <ListItem
                onClick={() => {
                  const trimmedTag = tagInput.trim();
                  if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
                    setTags([...tags, trimmedTag]);
                    if (!tagsStarted) setTagsStarted(true);
                    setShowCreateTagOption(false);
                  }
                  setTagInput('');
                  setTagSearchResults([]);
                }}
                sx={{ 
                  cursor: 'pointer',
                  py: 1,
                  '&:hover': { backgroundColor: 'action.hover' },
                  borderTop: tagSearchResults.length > 0 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                <ListItemText 
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">Create "{tagInput.trim()}"</Typography>
                      <Chip size="small" label="New" color="primary" variant="outlined" />
                    </Box>
                  }
                  secondary="This will create a new tag"
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            )}
          </Paper>
        )}
        
        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => setTags(tags.filter(t => t !== tag))}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        )}
        
        {tagsValidation && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
            {tagsValidation}
          </Typography>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Divider sx={{ my: 3 }} />
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          className={classes.button}
          size="medium"
          onClick={handleSubmit}
          disabled={loading || !isAuthenticated}
          sx={{ minWidth: 140 }}
        >
          {loading ? 'Posting...' : 'Post Question'}
        </Button>
        <Button 
          onClick={() => setOpen(false)} 
          variant="outlined" 
          size="medium"
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
  
  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
            Authentication Required
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Please{' '}
            <Link component="button" onClick={handleLoginRedirect} sx={{ cursor: 'pointer' }}>
              log in
            </Link>{' '}
            to post questions.
          </Typography>
        </Box>
      );
    }
    
    if (success) {
      return (
        <Box sx={{ py: 4 }}>
          <Alert severity="success">
            <AlertTitle>Question Posted Successfully!</AlertTitle>
            Your question has been posted and will open in a new tab.
          </Alert>
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ pr: { md: 2 } }}>
            {renderQuestionForm()}
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              position: { md: 'sticky' },
              top: { md: 24 },
              pl: { md: 2 },
              borderLeft: { md: '1px solid' },
              borderColor: { md: 'divider' }
            }}
          >
            {renderRightPanel()}
          </Box>
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
          width: success 
            ? { xs: '90vw', sm: '500px' }
            : { xs: '95vw', sm: '90vw', md: '85vw', lg: '80vw', xl: '75vw' },
          maxWidth: success ? '500px' : '1400px',
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          boxShadow: 24,
          borderRadius: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box 
          sx={{ 
            p: 2.5, 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Ask a Question
          </Typography>
          <IconButton 
            onClick={() => setOpen(false)} 
            size="small"
            sx={{ ml: 2 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ p: 3, overflow: 'auto', flexGrow: 1 }}>
          {renderContent()}
        </Box>
      </Box>
    </Modal>
  );
};