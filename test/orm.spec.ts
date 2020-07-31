import { createOrmConnection } from '../src/orm/orm.service';
import { Connection } from 'typeorm';
import { DB_TEST_CONNECTION } from './db-test.config';

describe('Orm Service', () => {
  test('create am orm connection', async (done) => {
    const connection = await createOrmConnection(DB_TEST_CONNECTION);
    expect(connection).toBeInstanceOf(Connection);
    await connection.close();
    done();
  });
});
