export default () => {
  const isProd = process.env.NODE_ENV === 'production';
  const defaultSecret = isProd ? undefined : 'secret';
  const accessSecret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || defaultSecret;

  if (isProd && (!accessSecret || accessSecret.length < 32 || accessSecret === 'secret')) {
    throw new Error(
      'CRITICAL SECURITY CONFIGURATION ERROR: JWT_ACCESS_SECRET must be set to a cryptographically strong secret of at least 32 characters in production.',
    );
  }

  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '4000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
      accessSecret: accessSecret || 'himalaya_erp_jwt_secret_dev_minimum_length_32_chars',
      accessExpiresIn:
        process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '1d',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-dev-minimum-length-32-chars',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },
    frontendUrl: process.env.FRONTEND_URL,
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  };
};
