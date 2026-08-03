import axios from 'axios';

interface LoginPayload {
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id?: string;
    email?: string;
    role?: any;
  };
}

interface LoginResponse {
  success?: boolean;
  accessToken?: string;
  access_token?: string;
  token?: string;
  data?: LoginPayload & {
    accessToken?: string;
    access_token?: string;
    token?: string;
    tokens?: {
      accessToken?: string;
    };
  };
}

function extractAccessToken(response: LoginResponse): string {
  const accessToken =
    response.accessToken ??
    response.access_token ??
    response.token ??
    response.data?.accessToken ??
    response.data?.access_token ??
    response.data?.token ??
    response.data?.tokens?.accessToken;

  if (!accessToken) {
    throw new Error(
      `Login succeeded but accessToken was not found. Response keys: ${Object.keys(
        response,
      ).join(', ')}, data keys: ${Object.keys(
        response.data ?? {},
      ).join(', ')}`,
    );
  }

  return accessToken;
}

async function main() {
  const email = process.env.E2E_SALES_EXECUTIVE_EMAIL || 'sales.executive.browser@himalayaerp.test';
  const password = process.env.E2E_COMMON_PASSWORD || 'admin123';
  const url = 'http://127.0.0.1:4000/api/v1/auth/login';

  console.log(`Preflight: Attempting HTTP login for ${email} at ${url}...`);

  let retries = 5;
  while (retries > 0) {
    try {
      const response = await axios.post(url, { email, password });
      const loginResponse = response.data as LoginResponse;

      console.log('Login response structure:', {
        topLevelKeys: Object.keys(loginResponse),
        dataKeys:
          loginResponse.data && typeof loginResponse.data === 'object'
            ? Object.keys(loginResponse.data)
            : [],
      });

      const accessToken = extractAccessToken(loginResponse);

      if (loginResponse.success === false && !accessToken) {
        throw new Error('Login response indicates failure.');
      }

      console.log('[PREFLIGHT] Login successful.');
      console.log('[PREFLIGHT] Access token present.');
      return;
    } catch (err: any) {
      if (err.response) {
        // HTTP errors like 401, 500
        console.error(`HTTP preflight failed with status ${err.response.status}:`, err.response.data);
        if (err.response.status === 401 || err.response.status === 403) {
          console.error('Authentication rejected (401/403). Ensure credentials exist and are unlocked.');
          process.exit(1);
        }
      } else {
        // Other errors: maybe connection errors or structural mismatch
        const message = err instanceof Error ? err.message : String(err);
        console.error(`HTTP login preflight failed: ${message}`);

        // Only retry on true network errors, not parse errors
        if (err.code && ['ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'].includes(err.code)) {
          console.log(`Retrying in 2 seconds... (${retries - 1} attempts left)`);
        } else {
          // If it's a structural error (like extractAccessToken throwing), exit immediately
          process.exit(1);
        }
      }

      retries--;
      if (retries === 0) {
        console.error('All HTTP login preflight retries failed.');
        process.exit(1);
      }
      
      await new Promise(res => setTimeout(res, 2000));
    }
  }
}

main();
