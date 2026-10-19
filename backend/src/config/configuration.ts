export interface AppConfig {
  port: number;
  frontendUrl: string;
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}


export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'replace-with-a-long-random-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
