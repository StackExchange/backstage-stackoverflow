import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './useStackOverflowData';

const columns: TableColumn[] = [
  { title: 'Username', field: 'name' },
  { title: 'Reputation', field: 'reputation', type: 'numeric' },
  { title: 'Profile Link', field: 'webUrl', render: (row: any) => <a href={row.webUrl} target="_blank" rel="noopener noreferrer">View Profile</a> },
];

export const StackOverflowTopUsers = () => {
  const { data, loading, error } = useStackOverflowData();

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  // Sort users by reputation (descending)
  const sortedUsers = data?.users.sort((a, b) => b.reputation - a.reputation) || [];

  return (
    <Table
      title="Top Users by Reputation"
      options={{ search: true, paging: true }}
      columns={columns}
      data={sortedUsers} // Use the sorted users array
    />
  );
};

export default StackOverflowTopUsers;
