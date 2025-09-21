export const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://mindbloomgenie.netlify.app/.netlify/functions/server'
    : 'http://localhost:5000/api',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5000'
};