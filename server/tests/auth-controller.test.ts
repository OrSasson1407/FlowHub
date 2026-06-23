import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login, getMe } from '../src/controllers/auth.controller';
import { User } from '../src/models';
import { publicUser, signAuthToken } from '../src/services/token.service';
import { env } from '../src/config/env';
import { invoke, mockReq, withPatch } from './helpers';

const makeUser = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'user-1',
    email: 'user@example.com',
    passwordHash: '$2a$12$hash',
    createdAt: new Date('2026-06-23T08:00:00.000Z'),
    updatedAt: new Date('2026-06-23T08:00:00.000Z'),
    ...overrides,
  }) as User;

describe('token service', () => {
  const users = [
    makeUser({ id: 'user-1', email: 'user@example.com' }),
    makeUser({ id: 'student-42', email: 'student@flowhub.dev' }),
    makeUser({ id: 'dev-99', email: 'dev@company.test' }),
    makeUser({ id: 'mixed-case', email: 'Mixed@Example.com' }),
  ];

  for (const user of users) {
    test(`signAuthToken encodes subject and email for ${user.id}`, () => {
      const token = signAuthToken(user);
      const decoded = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;

      assert.equal(decoded.sub, user.id);
      assert.equal(decoded.email, user.email);
    });

    test(`publicUser strips password hash for ${user.id}`, () => {
      const output = publicUser(user) as Record<string, unknown>;

      assert.equal(output.id, user.id);
      assert.equal(output.email, user.email);
      assert.equal(output.passwordHash, undefined);
    });
  }
});

describe('auth controller: register', () => {
  const validRegistrations = [
    ['basic email', 'user@example.com', 'password123'],
    ['uppercase email normalized', 'UPPER@EXAMPLE.COM', 'password123'],
    ['trimmed email', '  trim@example.com  ', 'password123'],
    ['long password accepted', 'long@example.com', 'x'.repeat(128)],
    ['symbol password accepted', 'symbol@example.com', 'p@ssword!'],
    ['subdomain email', 'a@students.example.edu', 'password123'],
  ] as const;

  for (const [name, email, password] of validRegistrations) {
    test(`registers ${name}`, async () => {
      let createPayload: Record<string, unknown> | undefined;
      await withPatch(User as any, 'findOne', async () => null, async () => {
        await withPatch(User as any, 'create', async (payload: Record<string, unknown>) => {
          createPayload = payload;
          return makeUser({ email: payload.email });
        }, async () => {
          const result = await invoke(register, mockReq({ body: { email, password } }));

          assert.equal(result.res.statusCodeValue, 201);
          assert.equal(createPayload!.email, email.trim().toLowerCase());
          assert.equal(typeof createPayload!.passwordHash, 'string');
          assert.equal((result.res.bodyValue as any).user.passwordHash, undefined);
          assert.equal(typeof (result.res.bodyValue as any).token, 'string');
        });
      });
    });
  }

  const invalidRegistrations = [
    ['missing email', { password: 'password123' }],
    ['missing password', { email: 'user@example.com' }],
    ['blank email', { email: ' ', password: 'password123' }],
    ['blank password', { email: 'user@example.com', password: ' ' }],
    ['short password', { email: 'user@example.com', password: 'short' }],
    ['non-string email', { email: 1, password: 'password123' }],
    ['non-string password', { email: 'user@example.com', password: 1 }],
    ['too long password', { email: 'user@example.com', password: 'x'.repeat(129) }],
  ] as const;

  for (const [name, body] of invalidRegistrations) {
    test(`rejects ${name}`, async () => {
      const result = await invoke(register, mockReq({ body }));
      assert.equal(result.next.length, 1);
    });
  }

  test('rejects duplicate email', async () => {
    await withPatch(User as any, 'findOne', async () => makeUser(), async () => {
      const result = await invoke(
        register,
        mockReq({ body: { email: 'user@example.com', password: 'password123' } }),
      );

      assert.equal((result.next[0] as any).statusCode, 409);
    });
  });
});

describe('auth controller: login', () => {
  const loginCases = [
    ['lowercase email', 'user@example.com'],
    ['uppercase email normalized', 'USER@EXAMPLE.COM'],
    ['trimmed email', '  user@example.com  '],
    ['subdomain email', 'user@student.example.edu'],
    ['symbol local part', 'first.last+test@example.com'],
  ] as const;

  for (const [name, email] of loginCases) {
    test(`logs in with ${name}`, async () => {
      await withPatch(User as any, 'findOne', async (options: any) => {
        assert.equal(options.where.email, email.trim().toLowerCase());
        return makeUser({ email: options.where.email });
      }, async () => {
        await withPatch(bcrypt as any, 'compare', async () => true, async () => {
          const result = await invoke(
            login,
            mockReq({ body: { email, password: 'password123' } }),
          );

          assert.equal(result.res.statusCodeValue, 200);
          assert.equal(typeof (result.res.bodyValue as any).token, 'string');
        });
      });
    });
  }

  const invalidLoginBodies = [
    ['missing email', { password: 'password123' }],
    ['missing password', { email: 'user@example.com' }],
    ['blank email', { email: '', password: 'password123' }],
    ['blank password', { email: 'user@example.com', password: '' }],
    ['non-string email', { email: false, password: 'password123' }],
    ['non-string password', { email: 'user@example.com', password: false }],
  ] as const;

  for (const [name, body] of invalidLoginBodies) {
    test(`rejects ${name}`, async () => {
      const result = await invoke(login, mockReq({ body }));
      assert.equal(result.next.length, 1);
    });
  }

  test('rejects unknown user', async () => {
    await withPatch(User as any, 'findOne', async () => null, async () => {
      const result = await invoke(
        login,
        mockReq({ body: { email: 'missing@example.com', password: 'password123' } }),
      );

      assert.equal((result.next[0] as any).statusCode, 401);
    });
  });

  test('rejects invalid password', async () => {
    await withPatch(User as any, 'findOne', async () => makeUser(), async () => {
      await withPatch(bcrypt as any, 'compare', async () => false, async () => {
        const result = await invoke(
          login,
          mockReq({ body: { email: 'user@example.com', password: 'wrongpass' } }),
        );

        assert.equal((result.next[0] as any).statusCode, 401);
      });
    });
  });
});

describe('auth controller: getMe', () => {
  test('returns current user', async () => {
    await withPatch(User as any, 'findByPk', async (id: string) => {
      assert.equal(id, 'user-1');
      return makeUser();
    }, async () => {
      const result = await invoke(
        getMe,
        mockReq({ user: { id: 'user-1', email: 'user@example.com' } }),
      );

      assert.equal((result.res.bodyValue as any).user.id, 'user-1');
    });
  });

  test('returns 404 when token user no longer exists', async () => {
    await withPatch(User as any, 'findByPk', async () => null, async () => {
      const result = await invoke(
        getMe,
        mockReq({ user: { id: 'missing', email: 'user@example.com' } }),
      );

      assert.equal((result.next[0] as any).statusCode, 404);
    });
  });
});
