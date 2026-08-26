import { LogLevel } from '@azure/msal-browser';
import type { Configuration } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: 'fa69f7fc-53cd-403a-a7de-08154b078ed2', // LawFirm-Web 的 Client ID
    authority: 'https://login.microsoftonline.com/35e75bbb-9e41-4f12-b890-e17d83d4077e',
    redirectUri: 'http://localhost:5173',
    postLogoutRedirectUri: 'http://localhost:5173',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
      },
    },
  },
};

// When requesting a token from the frontend, specify which API and scope to access.
export const loginRequest = {
  scopes: ['api://c4988ca6-bebf-4b6b-bbf9-2ef104f9384a/access_as_user'],
};

// Use this when calling the backend in Axios.
export const apiRequest = {
  scopes: ['api://c4988ca6-bebf-4b6b-bbf9-2ef104f9384a/access_as_user'],
};