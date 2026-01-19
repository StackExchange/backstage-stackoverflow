import { useApi } from '@backstage/core-plugin-api';
import { stackoverflowteamsApiRef } from '../../api';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StackAuthSuccess } from './StackAuthSuccess';
import { StackAuthLoading } from './StackAuthLoading';
import { StackAuthFailed } from './StackAuthFailed';

export const StackOverflowCallback = () => {
  const stackOverflowTeamsApi = useApi(stackoverflowteamsApiRef);
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const state = queryParams.get('state');
      const isLoggedIn = await stackOverflowTeamsApi.getAuthStatus();

      if (isLoggedIn) {
        setStatus('success')
        return;
      }

      if (!code || !state) {
        setStatus('error');
        return;
      }

      try {
        await stackOverflowTeamsApi.completeAuth(code, state);
        setStatus('success');
        window.history.replaceState({}, document.title, location.pathname);
      } catch (error) {
        setStatus('error');
      }
    };

    handleCallback();
  }, [location.pathname,location.search, stackOverflowTeamsApi]);

  if (status === 'loading') {
    return <StackAuthLoading />;
  }

  if (status === 'success') {
    return <StackAuthSuccess />;
  }

  return <StackAuthFailed />;
};
