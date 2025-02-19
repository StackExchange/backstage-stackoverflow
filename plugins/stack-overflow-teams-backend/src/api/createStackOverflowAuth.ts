import { LoggerService } from '@backstage/backend-plugin-api';
import { StackOverflowConfig } from '../services/StackOverflowService/types';
import crypto from 'crypto';

type ValidatedStackOverflowConfig = {
  clientId: number;
  redirectUri: string;
  baseUrl: string;
};

export function createStackOverflowAuth(
  config: StackOverflowConfig,
  logger: LoggerService,
) {
  // Validation
  if (!config.clientId || !config.redirectUri) {
    logger.error(
      'To create StackOverflow questions, you must specify a client_id and redirect_uri in the Stack Overflow config for OAuth purposes',
    );
    throw new Error(
      'Missing client_id or redirect_uri in Stack Overflow config',
    );
  }

  let normalizedBaseUrl: string;
  try {
    const baseUrlObj = new URL(config.baseUrl);
    normalizedBaseUrl = baseUrlObj.origin;
  } catch (error: any) {
    logger.error(`Invalid baseUrl: ${error.message}`);
    throw new Error('Invalid baseUrl in Stack Overflow config');
  }

  const validatedConfig: ValidatedStackOverflowConfig = {
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    baseUrl: normalizedBaseUrl,
  };

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

  async function getAuthUrl(): Promise<{ url: string; codeVerifier: string ; state: string}> {
    const { codeVerifier, codeChallenge } = await generatePKCECodeVerifier();
    const state = crypto.randomBytes(16).toString('hex');
    const authUrl = `${validatedConfig.baseUrl}/oauth?client_id=${
      validatedConfig.clientId
    }&redirect_uri=${encodeURIComponent(
      validatedConfig.redirectUri,
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

    return { url: authUrl, codeVerifier, state };
  }

  async function exchangeCodeForToken(
    code: string,
    codeVerifier: string,
  ): Promise<{accessToken: string, expires: number}> {
    const tokenUrl = `${validatedConfig.baseUrl}/oauth/access_token/json`;
    const queryParams = new URLSearchParams({
      client_id: String(validatedConfig.clientId),
      code,
      redirect_uri: validatedConfig.redirectUri,
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
      expires: data.expires
    }
  }

  return {
    getAuthUrl,
    exchangeCodeForToken,
  };
}
