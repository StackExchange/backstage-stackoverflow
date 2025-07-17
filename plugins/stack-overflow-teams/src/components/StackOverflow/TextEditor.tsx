import React, { useCallback, useMemo, useState } from 'react';
import { createEditor, Descendant, Editor, Transforms, Element as SlateElement } from 'slate';
import { Slate, Editable, withReact, useSlate, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  Tooltip,
  useTheme,
} from '@material-ui/core';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Title,
  LooksTwo,
  Looks3,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

// Types
interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  minHeight?: number;
  maxHeight?: number;
}

interface CustomElement {
  type: string;
  align?: string;
  children: CustomText[];
}

interface CustomText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

declare module 'slate' {
  interface CustomTypes {
    Editor: ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Styles
const useStyles = makeStyles((theme) => ({
  editor: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    transition: 'border-color 0.2s ease',
    '&:focus-within': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    '&.error': {
      borderColor: theme.palette.error.main,
    },
  },
  toolbar: {
    display: 'flex',
    gap: theme.spacing(0.5),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[50],
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  toolbarButton: {
    minWidth: 36,
    height: 36,
    padding: theme.spacing(0.5),
    '&.active': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  editorContent: {
    padding: theme.spacing(2),
    minHeight: 200,
    maxHeight: 400,
    overflow: 'auto',
    cursor: 'text',
    '& > div': {
      minHeight: 180,
      outline: 'none',
      fontSize: 14,
      lineHeight: 1.5,
      fontFamily: theme.typography.body1.fontFamily,
      width: '100%',
      height: '100%',
    },
    '& [data-slate-editor]': {
      minHeight: 180,
      width: '100%',
    },
  },
  helperText: {
    padding: theme.spacing(0, 2, 1),
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    '&.error': {
      color: theme.palette.error.main,
    },
  },
}));

// Constants
const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

// Helper functions
const isBlockActive = (editor: Editor, format: string, blockType = 'type') => {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType as keyof CustomElement] === format,
    })
  );

  return !!match;
};

const isMarkActive = (editor: Editor, format: keyof CustomText) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const toggleBlock = (editor: Editor, format: string) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  
  const newProperties: Partial<CustomElement> = TEXT_ALIGN_TYPES.includes(format)
    ? { align: isActive ? undefined : format }
    : {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
      };
  
  Transforms.setNodes<CustomElement>(editor, newProperties);

  if (!isActive && isList) {
    const block: CustomElement = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor: Editor, format: keyof CustomText) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

// Serialization functions
const serializeToHtml = (nodes: Descendant[]): string => {
  return nodes.map(n => serialize(n)).join('');
};

const serialize = (node: any): string => {
  // Check if it's a text node by looking for the 'text' property
  if (typeof node.text === 'string') {
    let string = node.text;
    if (node.bold) {
      string = `<strong>${string}</strong>`;
    }
    if (node.italic) {
      string = `<em>${string}</em>`;
    }
    if (node.underline) {
      string = `<u>${string}</u>`;
    }
    if (node.code) {
      string = `<code>${string}</code>`;
    }
    return string;
  }

  // It's an element node
  const children = node.children ? node.children.map((n: any) => serialize(n)).join('') : '';
  const alignStyle = node.align ? ` style="text-align: ${node.align}"` : '';

  switch (node.type) {
    case 'block-quote':
      return `<blockquote${alignStyle}>${children}</blockquote>`;
    case 'paragraph':
      return `<p${alignStyle}>${children}</p>`;
    case 'heading-one':
      return `<h1${alignStyle}>${children}</h1>`;
    case 'heading-two':
      return `<h2${alignStyle}>${children}</h2>`;
    case 'heading-three':
      return `<h3${alignStyle}>${children}</h3>`;
    case 'bulleted-list':
      return `<ul${alignStyle}>${children}</ul>`;
    case 'numbered-list':
      return `<ol${alignStyle}>${children}</ol>`;
    case 'list-item':
      return `<li${alignStyle}>${children}</li>`;
    case 'code-block':
      return `<pre${alignStyle}><code>${children}</code></pre>`;
    default:
      return `<p${alignStyle}>${children}</p>`;
  }
};

const deserializeFromHtml = (html: string): Descendant[] => {
  if (!html || html.trim() === '') {
    return [{ type: 'paragraph', children: [{ text: '' }] }];
  }
  
  // Simple HTML to Slate conversion
  const lines = html.split(/\n|<\/p>|<\/div>/);
  return lines
    .filter(line => line.trim())
    .map(line => ({
      type: 'paragraph',
      children: [{ text: line.replace(/<[^>]*>/g, '') }]
    }));
};

// Toolbar components
const MarkButton: React.FC<{ 
  format: keyof CustomText; 
  icon: React.ComponentType; 
  tooltip: string;
}> = ({ format, icon: Icon, tooltip }) => {
  const editor = useSlate();
  const classes = useStyles();
  const isActive = isMarkActive(editor, format);
  
  return (
    <Tooltip title={tooltip}>
      <Button
        className={`${classes.toolbarButton} ${isActive ? 'active' : ''}`}
        size="small"
        onMouseDown={event => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
      >
        <Icon />
      </Button>
    </Tooltip>
  );
};

const BlockButton: React.FC<{ 
  format: string; 
  icon: React.ComponentType; 
  tooltip: string;
}> = ({ format, icon: Icon, tooltip }) => {
  const editor = useSlate();
  const classes = useStyles();
  const isActive = isBlockActive(editor, format, TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type');
  
  return (
    <Tooltip title={tooltip}>
      <Button
        className={`${classes.toolbarButton} ${isActive ? 'active' : ''}`}
        size="small"
        onMouseDown={event => {
          event.preventDefault();
          toggleBlock(editor, format);
        }}
      >
        <Icon />
      </Button>
    </Tooltip>
  );
};

const Toolbar: React.FC = () => {
  const classes = useStyles();
  
  return (
    <Box className={classes.toolbar}>
      <MarkButton format="bold" icon={FormatBold} tooltip="Bold (Ctrl+B)" />
      <MarkButton format="italic" icon={FormatItalic} tooltip="Italic (Ctrl+I)" />
      <MarkButton format="underline" icon={FormatUnderlined} tooltip="Underline (Ctrl+U)" />
      <MarkButton format="code" icon={Code} tooltip="Code (Ctrl+`)" />
      
      <Divider orientation="vertical" flexItem style={{ margin: '0 8px' }} />
      
      <BlockButton format="heading-one" icon={Title} tooltip="Heading 1" />
      <BlockButton format="heading-two" icon={LooksTwo} tooltip="Heading 2" />
      <BlockButton format="heading-three" icon={Looks3} tooltip="Heading 3" />
      <BlockButton format="block-quote" icon={FormatQuote} tooltip="Quote" />
      
      <Divider orientation="vertical" flexItem style={{ margin: '0 8px' }} />
      
      <BlockButton format="numbered-list" icon={FormatListNumbered} tooltip="Numbered List" />
      <BlockButton format="bulleted-list" icon={FormatListBulleted} tooltip="Bulleted List" />
      
      <Divider orientation="vertical" flexItem style={{ margin: '0 8px' }} />
      
      <BlockButton format="left" icon={FormatAlignLeft} tooltip="Align Left" />
      <BlockButton format="center" icon={FormatAlignCenter} tooltip="Align Center" />
      <BlockButton format="right" icon={FormatAlignRight} tooltip="Align Right" />
      <BlockButton format="justify" icon={FormatAlignJustify} tooltip="Justify" />
    </Box>
  );
};

// Element renderer
const Element: React.FC<{ 
  attributes: any; 
  children: any; 
  element: CustomElement;
}> = ({ attributes, children, element }) => {
  const theme = useTheme();
  const style: React.CSSProperties = {};
  
  if (element.align) {
    style.textAlign = element.align as any;
  }
  
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote 
          style={{ 
            ...style, 
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            paddingLeft: 16,
            margin: '16px 0',
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
          }} 
          {...attributes}
        >
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul style={{ ...style, paddingLeft: 20 }} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={{ 
          ...style, 
          fontSize: '2rem', 
          fontWeight: 600, 
          margin: '16px 0 8px 0',
          color: theme.palette.text.primary,
        }} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={{ 
          ...style, 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          margin: '14px 0 6px 0',
          color: theme.palette.text.primary,
        }} {...attributes}>
          {children}
        </h2>
      );
    case 'heading-three':
      return (
        <h3 style={{ 
          ...style, 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          margin: '12px 0 4px 0',
          color: theme.palette.text.primary,
        }} {...attributes}>
          {children}
        </h3>
      );
    case 'list-item':
      return (
        <li style={{ ...style, margin: '4px 0' }} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol style={{ ...style, paddingLeft: 20 }} {...attributes}>
          {children}
        </ol>
      );
    case 'code-block':
      return (
        <pre style={{ 
          ...style,
          backgroundColor: theme.palette.grey[100],
          padding: 16,
          borderRadius: theme.shape.borderRadius,
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
        }} {...attributes}>
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <p style={{ ...style, margin: '8px 0' }} {...attributes}>
          {children}
        </p>
      );
  }
};

// Leaf renderer
const Leaf: React.FC<{ 
  attributes: any; 
  children: any; 
  leaf: CustomText;
}> = ({ attributes, children, leaf }) => {
  const theme = useTheme();
  
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = (
      <code style={{ 
        backgroundColor: theme.palette.grey[100],
        padding: '2px 4px',
        borderRadius: 3,
        fontSize: '0.9em',
        fontFamily: 'monospace',
      }}>
        {children}
      </code>
    );
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

// Main component
export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  onFocus, 
  placeholder = "Start typing...",
  error = false,
  helperText = "",
  minHeight = 200,
  maxHeight = 400,
}) => {
  const classes = useStyles();
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  // Initialize slate value from props
  const initialValue = useMemo(() => deserializeFromHtml(value), []);
  const [slateValue, setSlateValue] = useState<Descendant[]>(initialValue);

  const renderElement = useCallback((props: any) => <Element {...props} />, []);
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const handleChange = useCallback((newValue: Descendant[]) => {
    setSlateValue(newValue);
    
    // Only serialize and call onChange if the content actually changed
    const isAstChange = editor.operations.some(
      op => 'set_selection' !== op.type
    );
    
    if (isAstChange) {
      const htmlString = serializeToHtml(newValue);
      onChange(htmlString);
    }
  }, [editor, onChange]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    switch (event.key) {
      case 'b': {
        event.preventDefault();
        toggleMark(editor, 'bold');
        break;
      }
      case 'i': {
        event.preventDefault();
        toggleMark(editor, 'italic');
        break;
      }
      case 'u': {
        event.preventDefault();
        toggleMark(editor, 'underline');
        break;
      }
      case '`': {
        event.preventDefault();
        toggleMark(editor, 'code');
        break;
      }
    }
  };

  // Handle clicking anywhere in the editor content area
  const handleEditorClick = useCallback(() => {
    ReactEditor.focus(editor);
  }, [editor]);

  return (
    <Paper className={`${classes.editor} ${error ? 'error' : ''}`} elevation={0}>
      <Slate 
        editor={editor} 
        initialValue={slateValue} 
        onValueChange={handleChange}
      >
        <Toolbar />
        <Box 
          className={classes.editorContent}
          style={{ minHeight, maxHeight }}
          onClick={handleEditorClick}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            style={{
              minHeight: minHeight - 32, // Account for padding
              width: '100%',
              outline: 'none',
            }}
          />
        </Box>
      </Slate>
      {helperText && (
        <Typography className={`${classes.helperText} ${error ? 'error' : ''}`}>
          {helperText}
        </Typography>
      )}
    </Paper>
  );
};

export default RichTextEditor;