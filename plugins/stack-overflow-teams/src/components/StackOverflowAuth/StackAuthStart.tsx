import React from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';

export const StackOverflowAuthStart = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);

  const handleAuth = async () => {
    try {
      const authUrl = await stackOverflowTeamsApi.startAuth();
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error starting OAuth:', error);
    }
  };

  return <button onClick={handleAuth}>Login Stack</button>;
};
