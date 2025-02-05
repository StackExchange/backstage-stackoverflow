import React from 'react';
import { Table, TableColumn } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './useStackOverflowData';
import { Chip } from '@material-ui/core';
import { Tag } from '../../types';

const columns: TableColumn<Tag>[] = [
  {
    title: 'Tag Name',
    field: 'name',
    render: row => (
      <a
        href={row.webUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ cursor: 'pointer' }}
      >
        <Chip label={row.name} />
      </a>
    ),
  },
  { title: 'Questions', field: 'postCount', type: 'numeric' },
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
