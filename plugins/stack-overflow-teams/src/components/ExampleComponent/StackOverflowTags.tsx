import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './useStackOverflowData';

const columns: TableColumn[] = [
  { title: 'Tag Name', field: 'name' },
  { title: 'Questions', field: 'count', type: 'numeric' },
];

export const StackOverflowTags = () => {
  const { data, loading, error } = useStackOverflowData();

  if (loading) {
    return <Progress />;
  }

  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <Table
      title="Stack Overflow Tags"
      options={{ search: true, paging: true }}
      columns={columns}
      data={data?.tags || []} // Use the tags array
    />
  );
};

export default StackOverflowTags;
