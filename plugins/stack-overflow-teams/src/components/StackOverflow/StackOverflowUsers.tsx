import React from 'react';
import { Table } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import { User } from '../../api';
import { Chip, Typography } from '@material-ui/core';

type TableColumn<T> = {
  title: string;
  field: keyof T;
  type?: 'numeric' | 'boolean';
  render?: (row: T) => React.ReactNode;
};

const columns: TableColumn<User>[] = [
  {
    title: 'User Info',
    field: 'name',
    render: (row: User) => (
      <a 
        href={row.webUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none'}} // Flex for aligning profile picture and name
      >
        <img 
          src={row.avatarUrl} 
          alt={row.name} 
          style={{ width: 30, height: 30, borderRadius: '50%', marginRight: 8 }}
        />
        <Typography variant="body1" color="textPrimary">{row.name}</Typography>
      </a>
    ),
  },
  {
    title: 'Reputation',
    field: 'reputation',
    type: 'numeric',
  },
  {
    title: 'Job Title',
    field: 'jobTitle',
    render: (row: User) => (
      <Typography variant="body2" color="textSecondary">{row.jobTitle}</Typography>
    ),
  },
  {
    title: 'Department',
    field: 'department',
    render: (row: User) => (
      <Typography variant="body2" color="textSecondary">{row.department}</Typography>
    ),
  },
  {
    title: 'Role',
    field: 'role',
    render: (row: User) => (
      <Chip label={row.role} color="primary" size="small" />
    ),
  },
];

export const StackOverflowUsers = () => {
  const { data, loading, error } = useStackOverflowData('users');

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  // Sort users by reputation (descending)
  const sortedUsers = data?.users?.sort((a, b) => b.reputation - a.reputation) || [];

  return (
    <Table
      title="Stack Overflow Users"
      options={{ search: true, paging: true }}
      columns={columns}
      data={sortedUsers} // Use the sorted users array
    />
  );
};

export default StackOverflowUsers;