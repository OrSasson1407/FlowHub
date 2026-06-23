import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { createApp } from '../src/app';
import { env } from '../src/config/env';
import { requireAuth } from '../src/middleware/auth';
import { errorHandler } from '../src/middleware/error-handler';
import { routeNotFound } from '../src/middleware/not-found';
import { Integration, Task } from '../src/models';
import { syncIntegration } from '../src/services/sync.service';
import { integrationAdapters } from '../src/services/integration-adapters';
import {
  integrationProviders,
  taskCategories,
  taskPriorities,
  taskSources,
  taskStatuses,
} from '../src/types/domain';
import { HttpError } from '../src/utils/http-error';
import {
  enumValue,
  optionalDate,
  optionalString,
  requireString,
} from '../src/utils/validators';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../src/controllers/task.controller';
import {
  listIntegrations,
  syncIntegrationById,
  updateIntegration,
  upsertIntegration,
} from '../src/controllers/integration.controller';
import {
  captureNext,
  invoke,
  makeTask,
  mockReq,
  mockRes,
  startHttpServer,
  withPatch,
} from './helpers';

const authReq = (overrides: Record<string, unknown> = {}) =>
  mockReq({ user: { id: 'user-1', email: 'user@example.com' }, ...overrides });

const makeIntegration = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'integration-1',
    userId: 'user-1',
    provider: 'github',
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    tokenExpiresAt: new Date('2026-06-24T10:00:00.000Z'),
    isActive: true,
    configuredAt: new Date('2026-06-23T10:00:00.000Z'),
    lastSyncedAt: null,
    save: async function save() {
      return this;
    },
    ...overrides,
  }) as Integration;

describe('backend validation matrix', () => {
  const requiredStringValid = [
    ['plain', 'FlowHub', 'FlowHub'],
    ['trimmed', '  FlowHub  ', 'FlowHub'],
    ['hebrew', 'משימה', 'משימה'],
    ['numeric text', '12345', '12345'],
    ['max exact', 'x'.repeat(12), 'x'.repeat(12)],
    ['email text', 'user@example.com', 'user@example.com'],
    ['date text', '2026-06-23', '2026-06-23'],
    ['sentence', 'Finish backend tests', 'Finish backend tests'],
    ['symbols', 'task-#42', 'task-#42'],
    ['single char', 'A', 'A'],
    ['internal spaces', 'Deep work block', 'Deep work block'],
    ['slash text', 'github/pr', 'github/pr'],
    ['colon text', 'jira:FLOW-1', 'jira:FLOW-1'],
    ['paren text', '(calendar)', '(calendar)'],
    ['underscore text', 'user_name', 'user_name'],
  ] as const;

  for (const [name, value, expected] of requiredStringValid) {
    test(`requireString accepts ${name}`, () => {
      assert.equal(requireString({ title: value }, 'title', 64), expected);
    });
  }

  const requiredStringInvalid = [
    ['missing', {}],
    ['undefined', { title: undefined }],
    ['null', { title: null }],
    ['empty', { title: '' }],
    ['blank', { title: '   ' }],
    ['number', { title: 42 }],
    ['boolean', { title: true }],
    ['object', { title: { text: 'FlowHub' } }],
    ['array', { title: ['FlowHub'] }],
    ['too long', { title: 'x'.repeat(13) }],
    ['zero', { title: 0 }],
    ['date object', { title: new Date() }],
    ['function', { title: () => 'x' }],
    ['symbol', { title: Symbol('x') }],
    ['bigint', { title: BigInt(1) }],
  ] as const;

  for (const [name, body] of requiredStringInvalid) {
    test(`requireString rejects ${name}`, () => {
      assert.throws(() => requireString(body, 'title', 12), /title/);
    });
  }

  const optionalStringNull = [
    ['missing', {}],
    ['undefined', { description: undefined }],
    ['null', { description: null }],
    ['empty string', { description: '' }],
  ] as const;

  for (const [name, body] of optionalStringNull) {
    test(`optionalString normalizes ${name}`, () => {
      assert.equal(optionalString(body, 'description'), null);
    });
  }

  const optionalStringValid = [
    ['plain', 'details', 'details'],
    ['trimmed', '  details  ', 'details'],
    ['unicode', 'בדיקה', 'בדיקה'],
    ['long allowed', 'x'.repeat(80), 'x'.repeat(80)],
    ['markdown-ish', '- item', '- item'],
    ['url', 'https://example.com/task', 'https://example.com/task'],
    ['json text', '{"ok":true}', '{"ok":true}'],
    ['newline', 'line 1\nline 2', 'line 1\nline 2'],
    ['tab text', 'a\tb', 'a\tb'],
    ['hash text', '#important', '#important'],
    ['quoted text', '"quoted"', '"quoted"'],
    ['colon text', 'key: value', 'key: value'],
  ] as const;

  for (const [name, value, expected] of optionalStringValid) {
    test(`optionalString accepts ${name}`, () => {
      assert.equal(optionalString({ description: value }, 'description', 100), expected);
    });
  }

  const optionalStringInvalid = [
    ['number', { description: 1 }],
    ['boolean', { description: false }],
    ['object', { description: { value: 'x' } }],
    ['array', { description: ['x'] }],
    ['too long', { description: 'x'.repeat(101) }],
    ['date', { description: new Date() }],
    ['function', { description: () => 'x' }],
    ['symbol', { description: Symbol('x') }],
    ['bigint', { description: BigInt(1) }],
  ] as const;

  for (const [name, body] of optionalStringInvalid) {
    test(`optionalString rejects ${name}`, () => {
      assert.throws(() => optionalString(body, 'description', 100), /description/);
    });
  }

  const enumGroups = [
    ['task status', 'status', taskStatuses],
    ['task priority', 'priority', taskPriorities],
    ['task category', 'categoryTag', taskCategories],
    ['task source', 'source', taskSources],
    ['integration provider', 'provider', integrationProviders],
  ] as const;

  for (const [groupName, key, allowed] of enumGroups) {
    for (const value of allowed) {
      test(`enumValue accepts ${groupName} ${value}`, () => {
        assert.equal(enumValue({ [key]: value }, key, allowed), value);
      });
    }

    test(`enumValue falls back for ${groupName}`, () => {
      assert.equal(enumValue({}, key, allowed, allowed[0]), allowed[0]);
    });

    for (const badValue of ['bad', 'DONE', '', 1, false, null, ['todo'], { value: allowed[0] }]) {
      test(`enumValue rejects ${groupName} ${JSON.stringify(badValue)}`, () => {
        assert.throws(() => enumValue({ [key]: badValue }, key, allowed), new RegExp(key));
      });
    }
  }

  const dateNullCases = [
    ['missing', {}],
    ['undefined', { dueDate: undefined }],
    ['null', { dueDate: null }],
    ['empty', { dueDate: '' }],
  ] as const;

  for (const [name, body] of dateNullCases) {
    test(`optionalDate normalizes ${name}`, () => {
      assert.equal(optionalDate(body, 'dueDate'), null);
    });
  }

  const validDates = [
    ['date only', '2026-06-23'],
    ['iso utc', '2026-06-23T12:00:00.000Z'],
    ['with offset', '2026-06-23T15:00:00+03:00'],
    ['leap day', '2028-02-29T00:00:00.000Z'],
    ['end day', '2026-12-31T23:59:59.999Z'],
    ['epoch', '1970-01-01T00:00:00.000Z'],
    ['future', '2030-01-01T10:30:00.000Z'],
    ['month text', 'June 23, 2026'],
    ['timezone z', '2026-06-23T00:00:00Z'],
    ['millis omitted', '2026-06-23T00:00:00Z'],
  ] as const;

  for (const [name, value] of validDates) {
    test(`optionalDate accepts ${name}`, () => {
      assert.equal(optionalDate({ dueDate: value }, 'dueDate') instanceof Date, true);
    });
  }

  const invalidDates = [
    ['nonsense', 'not-a-date'],
    ['impossible month', '2026-13-01'],
    ['number', 1],
    ['boolean', true],
    ['object', { value: '2026-06-23' }],
    ['array', ['2026-06-23']],
    ['function', () => '2026-06-23'],
    ['invalid text', '2026-99-99T99:99:99Z'],
    ['symbol', Symbol('date')],
    ['bigint', BigInt(1)],
  ] as const;

  for (const [name, value] of invalidDates) {
    test(`optionalDate rejects ${name}`, () => {
      assert.throws(() => optionalDate({ dueDate: value }, 'dueDate'), /dueDate/);
    });
  }
});

describe('backend middleware and HTTP route matrix', () => {
  const validToken = jwt.sign({ email: 'user@example.com' }, env.jwtSecret, { subject: 'user-1' });

  const authHeaderCases = [
    ['missing authorization', undefined, false],
    ['empty authorization', '', false],
    ['wrong scheme', `Token ${validToken}`, false],
    ['lowercase bearer', `bearer ${validToken}`, false],
    ['bearer without token', 'Bearer ', false],
    ['valid bearer token', `Bearer ${validToken}`, true],
  ] as const;

  for (const [name, authorization, shouldPass] of authHeaderCases) {
    test(`requireAuth handles ${name}`, () => {
      const req = mockReq({ headers: authorization === undefined ? {} : { authorization } });
      const next = captureNext();
      requireAuth(req, mockRes(), next.next);

      assert.equal(Boolean(req.user), shouldPass);
      assert.equal(next.calls.length, 1);
    });
  }

  const invalidTokens = [
    ['random text', 'abc'],
    ['malformed jwt', 'a.b.c'],
    ['wrong secret', jwt.sign({ email: 'user@example.com' }, 'wrong')],
    ['expired', jwt.sign({ email: 'user@example.com' }, env.jwtSecret, { subject: 'user-1', expiresIn: '-1s' })],
  ] as const;

  for (const [name, token] of invalidTokens) {
    test(`requireAuth rejects ${name} token`, () => {
      const next = captureNext();
      requireAuth(mockReq({ headers: { authorization: `Bearer ${token}` } }), mockRes(), next.next);
      assert.match(String((next.calls[0] as Error).message), /Invalid|expired/i);
    });
  }

  const httpErrors = [400, 401, 403, 404, 409, 422, 429] as const;
  for (const status of httpErrors) {
    test(`errorHandler serializes ${status}`, () => {
      const res = mockRes();
      errorHandler(new HttpError(status, `E${status}`), mockReq(), res, () => undefined);
      assert.deepEqual(res.bodyValue, { error: `E${status}` });
    });
  }

  test('errorHandler serializes unknown errors', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), mockReq(), res, () => undefined);
    assert.equal(res.statusCodeValue, 500);
  });

  test('routeNotFound includes method and path', () => {
    const res = mockRes();
    routeNotFound(mockReq({ method: 'PATCH', path: '/missing' }), res);
    assert.deepEqual(res.bodyValue, { error: 'Route PATCH /missing not found' });
  });

  describe('HTTP app contracts', () => {
    let server: Awaited<ReturnType<typeof startHttpServer>>;

    before(async () => {
      server = await startHttpServer(createApp());
    });

    after(async () => {
      await server.close();
    });

    test('GET /health returns API status', async () => {
      const response = await fetch(`${server.url}/health`);
      assert.equal(response.status, 200);
    });

    const protectedRoutes = [
      ['GET', '/api/auth/me'],
      ['GET', '/api/tasks'],
      ['POST', '/api/tasks'],
      ['GET', '/api/tasks/task-1'],
      ['PATCH', '/api/tasks/task-1'],
      ['DELETE', '/api/tasks/task-1'],
      ['GET', '/api/integrations'],
      ['POST', '/api/integrations'],
      ['PATCH', '/api/integrations/integration-1'],
      ['POST', '/api/integrations/integration-1/sync'],
      ['GET', '/api/dashboard/today'],
      ['GET', '/api/dashboard/inbox'],
    ] as const;

    for (const [method, path] of protectedRoutes) {
      test(`${method} ${path} requires auth`, async () => {
        const response = await fetch(`${server.url}${path}`, { method });
        assert.equal(response.status, 401);
      });
    }

    const publicMissingRoutes = [
      ['GET', '/api/nope'],
      ['POST', '/api/nope'],
      ['GET', '/missing'],
      ['PATCH', '/health'],
    ] as const;

    for (const [method, path] of publicMissingRoutes) {
      test(`${method} ${path} returns 404`, async () => {
        const response = await fetch(`${server.url}${path}`, { method });
        assert.equal(response.status, 404);
      });
    }

    const authenticatedMissingRoutes = [
      ['PUT', '/api/tasks'],
      ['DELETE', '/api/dashboard/today'],
    ] as const;

    for (const [method, path] of authenticatedMissingRoutes) {
      test(`${method} ${path} returns 404 after auth succeeds`, async () => {
        const token = jwt.sign({ email: 'user@example.com' }, env.jwtSecret, { subject: 'user-1' });
        const response = await fetch(`${server.url}${path}`, {
          method,
          headers: { authorization: `Bearer ${token}` },
        });
        assert.equal(response.status, 404);
      });
    }
  });
});

describe('backend task controller matrix', () => {
  const createCases = [
    ...taskStatuses.map((status) => [`status ${status}`, { title: `Task ${status}`, status }] as const),
    ...taskPriorities.map((priority) => [`priority ${priority}`, { title: `Task ${priority}`, priority }] as const),
    ...taskCategories.map((categoryTag) => [`category ${categoryTag}`, { title: `Task ${categoryTag}`, categoryTag }] as const),
    ...taskSources.map((source) => [`source ${source}`, { title: `Task ${source}`, source, externalId: `${source}-1` }] as const),
    ['description trim', { title: 'Describe', description: '  details  ' }],
    ['due date', { title: 'Due', dueDate: '2026-06-23T10:00:00.000Z' }],
  ] as const;

  for (const [name, body] of createCases) {
    test(`createTask handles ${name}`, async () => {
      let payload: any;
      await withPatch(Task as any, 'create', async (received: any) => {
        payload = received;
        return makeTask(received);
      }, async () => {
        const result = await invoke(createTask, authReq({ body }));
        assert.equal(result.res.statusCodeValue, 201);
        assert.equal(payload.userId, 'user-1');
      });
    });
  }

  const invalidCreateBodies = [
    ['missing title', {}],
    ['empty title', { title: '' }],
    ['long title', { title: 'x'.repeat(256) }],
    ['bad status', { title: 'x', status: 'blocked' }],
    ['bad priority', { title: 'x', priority: 'urgent' }],
    ['bad category', { title: 'x', categoryTag: 'home' }],
    ['bad source', { title: 'x', source: 'slack' }],
    ['bad due date', { title: 'x', dueDate: 'not-a-date' }],
    ['bad description', { title: 'x', description: 4 }],
    ['bad external id', { title: 'x', externalId: { id: 1 } }],
  ] as const;

  for (const [name, body] of invalidCreateBodies) {
    test(`createTask rejects ${name}`, async () => {
      const result = await invoke(createTask, authReq({ body }));
      assert.equal(result.next.length, 1);
    });
  }

  const updateCases = [
    ...taskStatuses.map((status) => [`status ${status}`, { status }] as const),
    ...taskPriorities.map((priority) => [`priority ${priority}`, { priority }] as const),
    ...taskCategories.map((categoryTag) => [`category ${categoryTag}`, { categoryTag }] as const),
    ...taskSources.map((source) => [`source ${source}`, { source }] as const),
    ['title trim', { title: '  New title  ' }],
    ['description clear', { description: '' }],
    ['external id trim', { externalId: '  ext-1  ' }],
    ['due date clear', { dueDate: '' }],
    ['due date set', { dueDate: '2026-06-23T10:00:00.000Z' }],
  ] as const;

  for (const [name, body] of updateCases) {
    test(`updateTask handles ${name}`, async () => {
      const task = makeTask();
      await withPatch(Task as any, 'findOne', async () => task, async () => {
        const result = await invoke(updateTask, authReq({ params: { id: 'task-1' }, body }));
        assert.equal(result.res.statusCodeValue, 200);
      });
    });
  }

  const filterCases = [
    ['status', { status: 'todo' }],
    ['priority', { priority: 'high' }],
    ['source', { source: 'github' }],
    ['category', { categoryTag: 'study' }],
    ['status priority', { status: 'in_progress', priority: 'medium' }],
    ['source category', { source: 'jira', categoryTag: 'work' }],
    ['due before', { dueBefore: '2026-06-23T12:00:00.000Z' }],
    ['all filters', { status: 'todo', priority: 'low', source: 'gmail', categoryTag: 'personal', dueBefore: '2026-07-01' }],
  ] as const;

  for (const [name, query] of filterCases) {
    test(`listTasks applies ${name} filter`, async () => {
      let options: any;
      await withPatch(Task as any, 'findAll', async (received: any) => {
        options = received;
        return [makeTask()];
      }, async () => {
        const result = await invoke(listTasks, authReq({ query }));
        assert.equal(result.res.statusCodeValue, 200);
        assert.equal(options.where.userId, 'user-1');
      });
    });
  }

  test('listTasks rejects invalid dueBefore', async () => {
    const result = await invoke(listTasks, authReq({ query: { dueBefore: 'bad-date' } }));
    assert.match((result.next[0] as Error).message, /dueBefore/);
  });

  for (const action of ['get', 'delete', 'update'] as const) {
    test(`${action} task returns not found when ownership lookup misses`, async () => {
      await withPatch(Task as any, 'findOne', async () => null, async () => {
        const handler = action === 'get' ? getTask : action === 'delete' ? deleteTask : updateTask;
        const result = await invoke(handler, authReq({ params: { id: 'missing' }, body: { title: 'x' } }));
        assert.equal((result.next[0] as Error).message, 'Task not found');
      });
    });
  }
});

describe('backend integration and sync matrix', () => {
  for (const provider of integrationProviders) {
    test(`listIntegrations sanitizes ${provider}`, async () => {
      await withPatch(Integration as any, 'findAll', async () => [makeIntegration({ provider })], async () => {
        const result = await invoke(listIntegrations, authReq());
        const item = (result.res.bodyValue as any).integrations[0];
        assert.equal(item.provider, provider);
        assert.equal(item.accessToken, undefined);
        assert.equal(item.hasAccessToken, true);
      });
    });

    test(`upsertIntegration stores ${provider}`, async () => {
      const originalValidate = integrationAdapters[provider].validateCredentials;
      integrationAdapters[provider].validateCredentials = async () => true;

      try {
        let payload: any;
        await withPatch(Integration as any, 'upsert', async (received: any) => {
          payload = received;
          return [makeIntegration(received)];
        }, async () => {
          const result = await invoke(upsertIntegration, authReq({ body: { provider, accessToken: 'token' } }));
          assert.equal(result.res.statusCodeValue, 201);
          assert.equal(payload.provider, provider);
        });
      } finally {
        integrationAdapters[provider].validateCredentials = originalValidate;
      }
    });

    test(`syncIntegration imports ${provider} adapter items`, async () => {
      const originalFetch = integrationAdapters[provider].fetchItems;
      integrationAdapters[provider].fetchItems = async () => [
        {
          externalId: `${provider}-1`,
          title: `${provider} item`,
          source: provider,
          priority: 'high',
          categoryTag: 'work',
          dueDate: new Date('2026-06-25T10:00:00.000Z'),
        },
      ] as any;

      try {
        let payload: any;
        await withPatch(Task as any, 'upsert', async (received: any) => {
          payload = received;
          return [received, true];
        }, async () => {
          const result = await syncIntegration(makeIntegration({ provider }) as any);
          assert.equal(result.upserted, 1);
          assert.equal(payload.externalId, `${provider}-1`);
        });
      } finally {
        integrationAdapters[provider].fetchItems = originalFetch;
      }
    });
  }

  const invalidIntegrationBodies = [
    ['missing provider', {}],
    ['bad provider', { provider: 'slack' }],
    ['bad access token type', { provider: 'github', accessToken: 1 }],
    ['bad refresh token type', { provider: 'github', refreshToken: {} }],
    ['bad expiry', { provider: 'github', tokenExpiresAt: 'bad-date' }],
  ] as const;

  for (const [name, body] of invalidIntegrationBodies) {
    test(`upsertIntegration rejects ${name}`, async () => {
      const result = await invoke(upsertIntegration, authReq({ body }));
      assert.equal(result.next.length, 1);
    });
  }

  const updateCases = [
    ['accessToken', { accessToken: 'new-access' }],
    ['refreshToken', { refreshToken: 'new-refresh' }],
    ['clear accessToken', { accessToken: '' }],
    ['clear refreshToken', { refreshToken: '' }],
    ['tokenExpiresAt', { tokenExpiresAt: '2026-06-24T10:00:00.000Z' }],
    ['clear tokenExpiresAt', { tokenExpiresAt: '' }],
    ['isActive false', { isActive: false }],
    ['isActive true', { isActive: true }],
  ] as const;

  for (const [name, body] of updateCases) {
    test(`updateIntegration handles ${name}`, async () => {
      await withPatch(Integration as any, 'findOne', async () => makeIntegration(), async () => {
        const result = await invoke(updateIntegration, authReq({ params: { id: 'integration-1' }, body }));
        assert.equal(result.res.statusCodeValue, 200);
      });
    });
  }

  test('syncIntegration handles empty adapter result', async () => {
    const originalFetch = integrationAdapters.github.fetchItems;
    integrationAdapters.github.fetchItems = async () => [];
    try {
      const result = await syncIntegration(makeIntegration({ provider: 'github' }) as any);
      assert.equal(result.upserted, 0);
    } finally {
      integrationAdapters.github.fetchItems = originalFetch;
    }
  });

  test('syncIntegrationById requires active owned integration', async () => {
    await withPatch(Integration as any, 'findOne', async (options: any) => {
      assert.deepEqual(options.where, { id: 'integration-1', userId: 'user-1', isActive: true });
      return makeIntegration();
    }, async () => {
      const result = await invoke(syncIntegrationById, authReq({ params: { id: 'integration-1' } }));
      assert.equal((result.res.bodyValue as any).sync.upserted, 0);
    });
  });

  test('syncIntegrationById returns not found', async () => {
    await withPatch(Integration as any, 'findOne', async () => null, async () => {
      const result = await invoke(syncIntegrationById, authReq({ params: { id: 'missing' } }));
      assert.equal((result.next[0] as Error).message, 'Active integration not found');
    });
  });
});

describe('backend model/domain sanity matrix', () => {
  const modelEnums = [
    ['Task status enum', Task.getAttributes().status, taskStatuses],
    ['Task priority enum', Task.getAttributes().priority, taskPriorities],
    ['Task category enum', Task.getAttributes().categoryTag, taskCategories],
    ['Task source enum', Task.getAttributes().source, taskSources],
    ['Integration provider enum', Integration.getAttributes().provider, integrationProviders],
  ] as const;

  for (const [name, attribute, values] of modelEnums) {
    for (const value of values) {
      test(`${name} includes ${value}`, () => {
        assert.equal((attribute.values as readonly string[]).includes(value), true);
      });
    }
  }

  const taskIndexes = Task.options.indexes || [];
  for (const expected of ['user_id,status', 'user_id,due_date', 'user_id,source,external_id']) {
    test(`Task index covers ${expected}`, () => {
      const found = taskIndexes.some((index) => (index.fields || []).join(',') === expected);
      assert.equal(found, true);
    });
  }

  test('Integration has unique user/provider index', () => {
    const found = (Integration.options.indexes || []).some(
      (index) => index.unique && (index.fields || []).join(',') === 'user_id,provider',
    );
    assert.equal(found, true);
  });

  const operators = [
    ['not manual', { source: { [Op.ne]: 'manual' } }],
    ['not done', { status: { [Op.ne]: 'done' } }],
    ['before date', { dueDate: { [Op.lt]: new Date('2026-06-23') } }],
    ['between dates', { dueDate: { [Op.between]: [new Date('2026-06-23'), new Date('2026-06-24')] } }],
  ] as const;

  for (const [name, where] of operators) {
    test(`Sequelize operator object is constructible for ${name}`, () => {
      assert.equal(typeof where, 'object');
    });
  }
});
