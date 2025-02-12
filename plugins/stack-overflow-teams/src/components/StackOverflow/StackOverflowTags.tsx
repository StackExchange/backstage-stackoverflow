import React from 'react';
import { Table, TableColumn, Link } from '@backstage/core-components';
import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import { useStackOverflowData } from './hooks/';
import { Chip } from '@material-ui/core';
import { Tag } from '../../types';

const columns: TableColumn<Tag>[] = [
  {
    title: 'Tag Name',
    field: 'name',
    render: row => (
      <Link
        to={row.webUrl}
        noTrack
      >
        <Chip label={row.name} 
        clickable/>
      </Link>
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
