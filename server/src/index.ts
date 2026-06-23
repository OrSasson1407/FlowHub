import { createApp } from './app';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import './models';

const start = async () => {
  await connectDatabase();

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch((error) => {
  const pgCode = error?.parent?.code || error?.original?.code;

  if (pgCode === '28P01') {
    console.error(
      'Failed to start FlowHub API: PostgreSQL rejected the DB_USER/DB_PASSWORD in server/.env.',
    );
    console.error('Check DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, and DB_NAME.');
    process.exit(1);
  }

  if (pgCode === '3D000') {
    console.error('Failed to start FlowHub API: PostgreSQL database does not exist.');
    console.error(`Create the database named "${env.database.name}" or update DB_NAME in server/.env.`);
    process.exit(1);
  }

  console.error('Failed to start FlowHub API', error);
  process.exit(1);
});
