import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const StackOverflowCallback = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const location = useLocation();

  const handleCallback = async () => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');
    const state = queryParams.get('state')

    if (!code || !state) {
      console.error('OAuth code not found in URL');
      return;
    }

    try {
      await stackOverflowTeamsApi.completeAuth(code, state);
    } catch (error) {
      console.error('OAuth callback error:', error);
    }
  };

  useEffect(() => {
    handleCallback();
  }, [location.search, stackOverflowTeamsApi]);

  return <p>Authenticating...</p>;
};
