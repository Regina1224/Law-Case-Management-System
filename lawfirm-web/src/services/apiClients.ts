import axios from 'axios';
import { apiRequest, loginRequest } from '../app/msalConfig';
import { msalInstance } from '../app/msalInstance';

const apiClient = axios.create({
    baseURL: 'http://localhost:5241/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// MSAL's silent token renewal uses a hidden iframe. Firing acquireTokenSilent
// from several concurrent requests at once (e.g. a page that loads multiple
// resources in parallel) races that iframe and throws block_iframe_reload,
// so concurrent callers share a single in-flight request instead.
let inFlightTokenRequest: Promise<string> | null = null;

const getAccessToken = async (): Promise<string> => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    return '';
  }

  if (!inFlightTokenRequest) {
    inFlightTokenRequest = msalInstance
      .acquireTokenSilent({ ...apiRequest, account: accounts[0] })
      .then((response) => response.accessToken)
      .catch(async (error) => {
        await msalInstance.loginRedirect({ ...loginRequest, account: accounts[0] });
        throw error;
      })
      .finally(() => {
        inFlightTokenRequest = null;
      });
  }

  return inFlightTokenRequest;
};

// Request interceptor: Automatically obtains a token and adds it to the Authorization header before each request is sent.
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;