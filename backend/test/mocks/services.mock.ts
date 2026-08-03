export const createMockConfigService = () => ({
  get: jest.fn((key: string, defaultValue?: unknown) => {
    const config: Record<string, unknown> = {
      'jwt.accessSecret': 'test-access-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.accessExpiresIn': '15m',
      'jwt.refreshExpiresIn': '7d',
      bcryptRounds: 10,
    };
    return config[key] ?? defaultValue;
  }),
});

export const createMockAuditService = () => ({
  log: jest.fn().mockResolvedValue(true),
  getLogs: jest.fn().mockResolvedValue([]),
});

export const createMockJwtService = () => ({
  signAsync: jest.fn().mockResolvedValue('mock-token'),
  verify: jest
    .fn()
    .mockReturnValue({ sub: 'usr-test-123', jti: 'session-123' }),
  decode: jest
    .fn()
    .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
});
