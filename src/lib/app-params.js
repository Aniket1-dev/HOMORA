const isNode = typeof window === 'undefined';
export const appParams = {
  appId: 'homora-discover',
  token: !isNode ? window.localStorage.getItem('homora_access_token') : null,
  functionsVersion: 'v1',
  appBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000',
};
