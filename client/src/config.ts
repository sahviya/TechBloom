export const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://aesthetic-sorbet-0a4bdb.netlify.app/api'
    : 'http://localhost:5000/api',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5000'
};