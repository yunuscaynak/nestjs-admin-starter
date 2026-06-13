import { getCorsOrigins } from './cors.util';

describe('getCorsOrigins', () => {
  const originalCorsOrigins = process.env.CORS_ORIGINS;
  const originalPort = process.env.PORT;

  afterEach(() => {
    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    }

    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
  });

  it('includes the frontend defaults and local API origin when CORS_ORIGINS is unset', () => {
    delete process.env.CORS_ORIGINS;
    delete process.env.PORT;

    expect(getCorsOrigins()).toEqual([
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3002',
    ]);
  });

  it('preserves configured origins and appends the local API origin for Swagger', () => {
    process.env.CORS_ORIGINS =
      'https://admin.example.com, http://localhost:3001';
    process.env.PORT = '4010';

    expect(getCorsOrigins()).toEqual([
      'https://admin.example.com',
      'http://localhost:3001',
      'http://localhost:4010',
      'http://127.0.0.1:4010',
    ]);
  });
});
