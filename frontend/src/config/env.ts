export const ENV = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV !== 'production',
  APP_NAME: 'SupportOps',
} as const;

export default ENV;
