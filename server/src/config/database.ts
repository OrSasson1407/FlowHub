import { Sequelize } from 'sequelize';
import { env, isProduction } from './env';

const assertDatabaseConfig = () => {
  if (!env.database.url && !env.database.password) {
    throw new Error(
      'DB_PASSWORD is required for PostgreSQL password authentication. Set DB_PASSWORD in server/.env or provide DATABASE_URL.',
    );
  }
};

export const sequelize = env.database.url
  ? new Sequelize(env.database.url, {
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
    })
  : new Sequelize(env.database.name, env.database.user, env.database.password, {
      host: env.database.host,
      port: env.database.port,
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
    });

export const connectDatabase = async () => {
  assertDatabaseConfig();
  await sequelize.authenticate();
  await sequelize.sync();
};
