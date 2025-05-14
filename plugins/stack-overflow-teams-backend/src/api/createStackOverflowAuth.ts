import { LoggerService } from '@backstage/backend-plugin-api';
import { StackOverflowConfig } from '../services/StackOverflowService/types';
import crypto from 'crypto';

export function createStackOverflowAuth(
  config: StackOverflowConfig,
  logger: LoggerService,
) {
  async function generatePKCECodeVerifier(): Promise<{
    codeVerifier: string;
    codeChallenge: string;
  }> {
    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const hashed = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    return { codeVerifier, codeChallenge: hashed };
  }

  async function getAuthUrl(): Promise<{
    url: string;
    codeVerifier: string;
    state: string;
  }> {
    if (!config.clientId || !config.redirectUri) {
      throw new Error(
        'clientId and redirectUri are required for authentication',
      );
    }
    const { codeVerifier, codeChallenge } = await generatePKCECodeVerifier();
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${config.baseUrl}/oauth?client_id=${
      config.clientId
    }&redirect_uri=${encodeURIComponent(
      config.redirectUri,
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}&scope=write_access`;

    return { url: authUrl, codeVerifier, state };
  }

  async function exchangeCodeForToken(
    code: string,
    codeVerifier: string,
  ): Promise<{ accessToken: string; expires: number }> {
    if (!config.clientId || !config.redirectUri) {
      throw new Error(
        'clientId and redirectUri are required for authentication',
      );
    }
    const tokenUrl = `${config.baseUrl}/oauth/access_token/json`;
    const queryParams = new URLSearchParams({
      client_id: String(config.clientId),
      code,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(`${tokenUrl}?${queryParams.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!response.ok) {
      logger.error('Failed to exchange code for access token');
      throw new Error(await response.text());
    }
    const data = await response.json();
    return {
      accessToken: data.access_token,
      expires: data.expires,
    };
  }

  return {
    getAuthUrl,
    exchangeCodeForToken,
    config: config,
  };
}
