import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

export const DB_TEST_CONNECTION: SqliteConnectionOptions = {
  type: 'sqlite',
  database: 'database.test.sqlite',
  synchronize: true,
  logging: false,
  entities: ['src/orm/entity/**/*.ts'],
  migrations: ['src/orm/migration/**/*.ts'],
  subscribers: ['src/orm/subscriber/**/*.ts'],
  cli: {
    entitiesDir: 'src/orm/entity',
    migrationsDir: 'src/orm/migration',
    subscribersDir: 'src/orm/subscriber',
  },
};
