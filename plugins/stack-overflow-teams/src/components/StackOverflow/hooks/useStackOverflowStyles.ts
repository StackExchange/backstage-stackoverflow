import { makeStyles, Theme } from '@material-ui/core/styles';

/**
 * Reusable styles for Stack Overflow-themed components with dark mode support
 */
export const useStackOverflowStyles = makeStyles((theme: Theme) => ({
  title: {
    color: theme.palette.type === 'dark' ? '#4CA8FF' : '#0077CC', // Brighter blue in dark mode
    fontWeight: 'bold',
  },
  unanswered: {
    backgroundColor: theme.palette.type === 'dark' ? '#3B2D1F' : '#FFF4E5', // Darker orange for dark mode
    borderRadius: '4px',
    padding: '4px 8px',
  },
  answered: {
    backgroundColor: theme.palette.type === 'dark' ? '#1E4620' : '#E3FCEF', // Darker green for dark mode
    borderRadius: '4px',
    padding: '4px 8px',
  },
  button: {
    backgroundColor: '#F48024', // Stack Overflow orange
    color: '#fff',
    '&:hover': {
      backgroundColor: theme.palette.type === 'dark' ? '#C15C17' : '#D4691E',
    },
  },
  tableRow: {
    backgroundColor: theme.palette.background.paper,
    '&:hover': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? theme.palette.action.hover
          : '#F5F5F5', // Light gray hover effect in light mode
    },
  },
}));
