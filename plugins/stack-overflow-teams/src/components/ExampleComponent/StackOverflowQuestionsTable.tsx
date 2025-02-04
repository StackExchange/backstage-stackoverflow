import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './useStackOverflowData';

const columns: TableColumn[] = [
  { title: 'Title', field: 'title' },
  { title: 'Score', field: 'score', type: 'numeric' },
  { title: 'View Count', field: 'view_count', type: 'numeric' },
  { title: 'Answered', field: 'is_answered', type: 'boolean' },
  { title: 'Link', field: 'link', render: (row: any) => <a href={row.link} target="_blank" rel="noopener noreferrer">View</a> },
];

export const StackOverflowQuestionsTable = () => {
  const { data, loading, error } = useStackOverflowData();

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Table
      title="Stack Overflow Questions"
      options={{ search: true, paging: true }}
      columns={columns}
      data={data?.questions || []} // Ensure data is an array
    />
  );
};

export default StackOverflowQuestionsTable;
