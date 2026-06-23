import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { Op } from 'sequelize';
import { todayDashboard, unifiedInbox } from '../src/controllers/dashboard.controller';
import { getTodayDashboard } from '../src/services/dashboard.service';
import { Task } from '../src/models';
import { invoke, makeTask, mockReq, withPatch } from './helpers';

const authReq = (overrides: Record<string, unknown> = {}) =>
  mockReq({ user: { id: 'user-1', email: 'user@example.com' }, ...overrides });

describe('dashboard service', () => {
  test('builds today dashboard from task query buckets', async () => {
    const calls: any[] = [];
    const today = [
      makeTask({ id: 'calendar-1', source: 'calendar' }),
      makeTask({ id: 'manual-1', source: 'manual' }),
    ];
    const overdue = [makeTask({ id: 'overdue-1' })];
    const high = [makeTask({ id: 'high-1', priority: 'high' })];
    const inbox = [makeTask({ id: 'github-1', source: 'github' })];
    const results = [today, overdue, high, inbox];

    await withPatch(Task as any, 'findAll', async (options: any) => {
      calls.push(options);
      return results[calls.length - 1];
    }, async () => {
      await withPatch(Task as any, 'count', async (options: any) => {
        calls.push({ count: options });
        return calls.length === 5 ? 7 : 3;
      }, async () => {
        const dashboard = await getTodayDashboard('user-1', new Date('2026-06-23T15:30:00+03:00'));

        assert.equal(dashboard.date, '2026-06-23');
        assert.equal(dashboard.overview.totalOpen, 7);
        assert.equal(dashboard.overview.doneToday, 3);
        assert.equal(dashboard.overview.dueToday, 2);
        assert.equal(dashboard.overview.overdue, 1);
        assert.equal(dashboard.overview.highPriority, 1);
        assert.deepEqual(dashboard.calendarBlock.map((task) => task.id), ['calendar-1']);
        assert.equal(calls[0].where.userId, 'user-1');
      });
    });
  });

  const dateCases = [
    ['start of year', '2026-01-01T12:00:00.000Z'],
    ['middle of year', '2026-06-23T12:00:00.000Z'],
    ['end of year', '2026-12-31T12:00:00.000Z'],
    ['leap day', '2028-02-29T12:00:00.000Z'],
    ['near midnight', '2026-06-23T23:59:59.000Z'],
    ['morning offset', '2026-06-23T08:00:00+03:00'],
  ] as const;

  for (const [name, value] of dateCases) {
    test(`queries day boundaries for ${name}`, async () => {
      let firstQuery: any;
      await withPatch(Task as any, 'findAll', async (options: any) => {
        firstQuery ??= options;
        return [];
      }, async () => {
        await withPatch(Task as any, 'count', async () => 0, async () => {
          await getTodayDashboard('user-1', new Date(value));

          const range = firstQuery.where.dueDate[Op.between];
          assert.equal(range[0] instanceof Date, true);
          assert.equal(range[1] instanceof Date, true);
          assert.equal(range[0].getHours(), 0);
          assert.equal(range[1].getHours(), 23);
        });
      });
    });
  }

  test('queries high-priority open tasks with limit', async () => {
    const calls: any[] = [];
    await withPatch(Task as any, 'findAll', async (options: any) => {
      calls.push(options);
      return [];
    }, async () => {
      await withPatch(Task as any, 'count', async () => 0, async () => {
        await getTodayDashboard('user-1', new Date('2026-06-23T10:00:00.000Z'));

        assert.equal(calls[2].where.priority, 'high');
        assert.equal(calls[2].limit, 10);
      });
    });
  });

  test('queries unified inbox with external source and todo status', async () => {
    const calls: any[] = [];
    await withPatch(Task as any, 'findAll', async (options: any) => {
      calls.push(options);
      return [];
    }, async () => {
      await withPatch(Task as any, 'count', async () => 0, async () => {
        await getTodayDashboard('user-1', new Date('2026-06-23T10:00:00.000Z'));

        assert.deepEqual(calls[3].where.source, { [Op.ne]: 'manual' });
        assert.equal(calls[3].where.status, 'todo');
        assert.equal(calls[3].limit, 20);
      });
    });
  });
});

describe('dashboard controller', () => {
  const validDateQueries = [
    ['no date', {}],
    ['date only', { date: '2026-06-23' }],
    ['iso date', { date: '2026-06-23T10:00:00.000Z' }],
    ['offset date', { date: '2026-06-23T13:00:00+03:00' }],
    ['empty date uses now', { date: '' }],
  ] as const;

  for (const [name, query] of validDateQueries) {
    test(`todayDashboard accepts ${name}`, async () => {
      await withPatch(Task as any, 'findAll', async () => [], async () => {
        await withPatch(Task as any, 'count', async () => 0, async () => {
          const result = await invoke(todayDashboard, authReq({ query }));

          assert.equal(result.res.statusCodeValue, 200);
          assert.equal(typeof (result.res.bodyValue as any).dashboard.date, 'string');
        });
      });
    });
  }

  const invalidDateQueries = [
    ['bad text', { date: 'bad-date' }],
    ['bad month', { date: '2026-99-99' }],
    ['number ignored as now', { date: 1 }],
    ['array ignored as now', { date: ['2026-06-23'] }],
  ] as const;

  for (const [name, query] of invalidDateQueries.slice(0, 2)) {
    test(`todayDashboard rejects ${name}`, async () => {
      const result = await invoke(todayDashboard, authReq({ query }));
      assert.match((result.next[0] as Error).message, /date/);
    });
  }

  for (const [name, query] of invalidDateQueries.slice(2)) {
    test(`todayDashboard treats ${name} as default date`, async () => {
      await withPatch(Task as any, 'findAll', async () => [], async () => {
        await withPatch(Task as any, 'count', async () => 0, async () => {
          const result = await invoke(todayDashboard, authReq({ query }));
          assert.equal(result.res.statusCodeValue, 200);
        });
      });
    });
  }

  test('unifiedInbox queries external unfinished tasks for current user', async () => {
    let received: any;
    await withPatch(Task as any, 'findAll', async (options: any) => {
      received = options;
      return [makeTask({ source: 'github' })];
    }, async () => {
      const result = await invoke(unifiedInbox, authReq());

      assert.equal(received.where.userId, 'user-1');
      assert.deepEqual(received.where.source, { [Op.ne]: 'manual' });
      assert.deepEqual(received.where.status, { [Op.ne]: 'done' });
      assert.equal((result.res.bodyValue as any).inbox.length, 1);
    });
  });
});
