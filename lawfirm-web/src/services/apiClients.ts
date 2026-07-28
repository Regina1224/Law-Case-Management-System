import axios from 'axios';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig, apiRequest } from '../app/msalConfig';

const msalInstance = new PublicClientApplication(msalConfig);

const apiClient = axios.create({
    baseURL: 'https://localhost:7193/api',
    headers: {
        'Content-Type': 'application/json',
    },
});


// Request interceptor: Automatically obtains a token and adds it to the Authorization header before each request is sent.
apiClient.interceptors.request.use(async (config) => {
  const accounts = msalInstance.getAllAccounts();
  
  if (accounts.length > 0) {
    const response = await msalInstance.acquireTokenSilent({
      ...apiRequest,
      account: accounts[0],
    });
    config.headers.Authorization = `Bearer ${response.accessToken}`;
  }
  
  return config;
});

export default apiClient;