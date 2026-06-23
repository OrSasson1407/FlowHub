import http from 'http';
import { AddressInfo } from 'net';
import { Request, Response } from 'express';

export type MockResponse = Response & {
  statusCodeValue: number;
  bodyValue: unknown;
  sentValue: unknown;
};

export const mockReq = (overrides: Partial<Request> = {}) =>
  ({
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  }) as Request;

export const mockRes = () => {
  const response = {
    statusCodeValue: 200,
    bodyValue: undefined,
    sentValue: undefined,
    status(code: number) {
      this.statusCodeValue = code;
      return this;
    },
    json(body: unknown) {
      this.bodyValue = body;
      return this;
    },
    send(body?: unknown) {
      this.sentValue = body;
      return this;
    },
  };

  return response as MockResponse;
};

export const captureNext = () => {
  const calls: unknown[] = [];
  const next = (error?: unknown) => {
    calls.push(error);
  };

  return { calls, next };
};

export const patch = <T extends object, K extends keyof T>(target: T, key: K, value: T[K]) => {
  const original = target[key];
  target[key] = value;
  return () => {
    target[key] = original;
  };
};

export const withPatch = async <T extends object, K extends keyof T, R>(
  target: T,
  key: K,
  value: T[K],
  callback: () => Promise<R> | R,
) => {
  const restore = patch(target, key, value);
  try {
    return await callback();
  } finally {
    restore();
  }
};

export const invoke = async (
  handler: (req: Request, res: Response, next: (error?: unknown) => void) => unknown,
  req: Request,
  res = mockRes(),
) => {
  const next = captureNext();
  await handler(req, res, next.next);
  return { res, next: next.calls };
};

export const startHttpServer = async (app: http.RequestListener) => {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as AddressInfo;

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      ),
  };
};

export const makeTask = (overrides: Record<string, unknown> = {}) => ({
  id: 'task-1',
  userId: 'user-1',
  title: 'Ship FlowHub',
  description: null,
  source: 'manual',
  externalId: null,
  status: 'todo',
  priority: 'medium',
  categoryTag: 'work',
  dueDate: null,
  completedAt: null,
  createdAt: new Date('2026-06-23T08:00:00.000Z'),
  updatedAt: new Date('2026-06-23T08:00:00.000Z'),
  update: async function update(values: Record<string, unknown>) {
    Object.assign(this, values);
    return this;
  },
  destroy: async function destroy() {
    return undefined;
  },
  save: async function save() {
    return this;
  },
  ...overrides,
});
