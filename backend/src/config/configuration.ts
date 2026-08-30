export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'secret',
    accessExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL,
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
});
