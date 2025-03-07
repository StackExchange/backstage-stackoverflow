import React, { useEffect, useState } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../api';
import { useLocation } from 'react-router-dom';
import { StackOverflowCallback, StackOverflowAuthStart } from '../components/StackOverflowAuth';
import { StackOverflowHub } from './StackOverflowHub'; // Your main hub page
import { StackAuthLoading } from '../components/StackOverflowAuth/StackAuthLoading';

export const StackOverflowTeamsPage = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const location = useLocation();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated' | 'callback'>('loading');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await stackOverflowTeamsApi.getAuthStatus();
        setAuthStatus(isLoggedIn ? 'authenticated' : 'unauthenticated');
      } catch (error) {
        setAuthStatus('unauthenticated');
      }
    };

    // If the user is returning from an OAuth callback, handle it first
    if (location.search.includes('code=')) {
      setAuthStatus('callback');
    } else {
      checkAuth();
    }
  }, [location.search, stackOverflowTeamsApi]);

  if (authStatus === 'loading') {
    return <StackAuthLoading />;
  }

  if (authStatus === 'callback') {
    return <StackOverflowCallback />;
  }

  if (authStatus === 'authenticated') {
    return <StackOverflowHub />;
  }

  return <StackOverflowAuthStart />;
};
