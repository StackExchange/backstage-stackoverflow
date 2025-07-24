import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  FormatClear,
  // Undo,
  // Redo
} from '@mui/icons-material';
import Button  from '@mui/material/Button';

interface TiptapEditorProps {
  content?: string;
  onUpdate?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  error?: boolean;
  onFocus?: () => void;
  modifierKey?: {
    symbol: string,
    text: string
  }
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content = '',
  onUpdate,
  placeholder = 'Start typing...',
  editable = true,
  error = false,
  onFocus,
  modifierKey = { symbol: 'Ctrl', text: 'Ctrl' }
}) => {
  const theme = useTheme();
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    shouldRerenderOnTransaction: true,
    content,
    editable,
    onUpdate: ({ editor: tiptapEditor }) => {
      if (onUpdate) {
        onUpdate(tiptapEditor.getHTML());
      }
    },
    onFocus: () => {
      if (onFocus) {
        onFocus();
      }
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    disabled, 
    children, 
    title 
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      onMouseDown={(e) => {
        e.preventDefault()
      }}
      onClick={onClick}
      disabled={disabled}
      variant={isActive ? 'contained' : 'text'}
      title={title}
      size="small"
    >
      {children}
    </Button>
  );

  return (
    <Paper 
      variant="outlined"
      sx={{
        border: error ? `2px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        '&:focus-within': {
          borderColor: theme.palette.primary.main,
          borderWidth: '2px',
        },
        transition: 'border-color 0.2s ease-in-out',
      }}
    >
      <Toolbar 
        sx={{ 
          backgroundColor: theme.palette.background.default,
          borderBottom: `1px solid ${theme.palette.divider}`,
          minHeight: 48,
          flexWrap: 'wrap',
          py: 0.5,
          px: 1,
          alignItems: 'center',
        }}
      >
        {/* Text Formatting Group */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title={`Bold (${modifierKey.text}+B)`}
        >
          <FormatBold fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title={`Italic (${modifierKey.text}+I)`}
        >
          <FormatItalic fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title={`Underline (${modifierKey.text}+U)`}
        >
          <FormatUnderlined fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title={`Inline Code (${modifierKey.text}+E)`}
        >
          <Code fontSize="medium" />
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

        {/* Headings Group */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title={`Heading 1 (${modifierKey.text}+Alt+1)`}
        >
          <Typography component="span" fontWeight="bold" fontSize="11px">
            H1
          </Typography>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title={`Heading 2 (${modifierKey.text}+Alt+2)`}
        >
          <Typography component="span" fontWeight="bold" fontSize="11px">
            H2
          </Typography>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title={`Heading 3 (${modifierKey.text}+Alt+3)`}
        >
          <Typography component="span" fontWeight="bold" fontSize="11px">
            H3
          </Typography>
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

        {/* Lists and Blocks Group */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <FormatListBulleted fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <FormatListNumbered fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <FormatQuote fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Typography variant="caption" component="span" fontWeight="bold" fontSize="10px">
            {'</>'}
          </Typography>
        </ToolbarButton>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

        {/* Utility Group */}
          <ToolbarButton
            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            title="Clear Format"
          >
            <FormatClear fontSize="medium" />
          </ToolbarButton>

          <Box sx={{ flexGrow: 1 }} />

        {/* History Group */}
        {/* <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title={`Undo (${modifierKey.text}+Z)`}
        >
          <Undo fontSize="medium" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title={`Redo (${modifierKey.text}+Y)`}
        >
          <Redo fontSize="medium" />
        </ToolbarButton> */}
      </Toolbar>
      
      <Box 
        onClick={() => editor.chain().focus().run()}
        sx={{
          p: 2,
          minHeight: 200,
          cursor: 'text',
          backgroundColor: theme.palette.background.paper,
          '& .ProseMirror': {
            outline: 'none',
            minHeight: 168,
            fontFamily: theme.typography.body1.fontFamily,
            fontSize: theme.typography.body1.fontSize,
            lineHeight: theme.typography.body1.lineHeight,
            color: theme.palette.text.primary,
            '& p': {
              margin: theme.spacing(0, 0, 1, 0),
              '&:last-child': {
                marginBottom: 0,
              },
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              fontWeight: theme.typography.fontWeightBold,
              marginTop: theme.spacing(2),
              marginBottom: theme.spacing(1),
              '&:first-of-type': {
                marginTop: 0,
              },
            },
            '& h1': {
              fontSize: theme.typography.h4.fontSize,
            },
            '& h2': {
              fontSize: theme.typography.h5.fontSize,
            },
            '& h3': {
              fontSize: theme.typography.h6.fontSize,
            },
            '& ul, & ol': {
              paddingLeft: theme.spacing(3),
              margin: theme.spacing(1, 0),
            },
            '& li': {
              marginBottom: theme.spacing(0.5),
            },
            '& blockquote': {
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              paddingLeft: theme.spacing(2),
              margin: theme.spacing(2, 0),
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[700] 
                : theme.palette.grey[50],
              borderRadius: theme.spacing(0, 1, 1, 0),
            },
            '& code': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[700] 
                : theme.palette.grey[100],
              padding: theme.spacing(0.5, 0.75),
              borderRadius: theme.shape.borderRadius,
              fontFamily: 'Monaco, "Roboto Mono", monospace',
              fontSize: '0.875em',
              color: theme.palette.mode === 'dark'
                ? theme.palette.primary.light
                : theme.palette.primary.dark,
            },
            '& pre': {
              backgroundColor: theme.palette.mode === 'dark' 
                ? theme.palette.grey[700] 
                : theme.palette.grey[100],
              padding: theme.spacing(2),
              overflow: 'auto',
              margin: theme.spacing(2, 0),
              border: `1px solid ${theme.palette.divider}`,
              '& code': {
                backgroundColor: 'transparent',
                padding: 0,
                color: theme.palette.text.primary,
              },
            },
            '& strong': {
              fontWeight: theme.typography.fontWeightBold,
            },
            '& em': {
              fontStyle: 'italic',
            },
            '& u': {
              textDecoration: 'underline',
            },
            '& p.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              color: theme.palette.text.disabled,
              pointerEvents: 'none',
              height: 0,
              fontStyle: 'italic',
            },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
};