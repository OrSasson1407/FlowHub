# FlowHub Server

Express + TypeScript API for the FlowHub MVP.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

## Required Services

The API expects PostgreSQL using `DATABASE_URL` or the `DB_*` variables in `.env`.
On startup, Sequelize authenticates and syncs the MVP tables.

## API Surface

- `GET /health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/integrations`
- `POST /api/integrations`
- `PATCH /api/integrations/:id`
- `POST /api/integrations/:id/sync`
- `GET /api/dashboard/today`
- `GET /api/dashboard/inbox`

Use `Authorization: Bearer <token>` for all routes except health, register, and login.
