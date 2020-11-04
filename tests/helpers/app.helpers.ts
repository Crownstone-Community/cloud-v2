import {CrownstoneCloud} from "../../src/application";
import {testdb} from "../fixtures/datasources/testdb.datasource";

export async function createApp() : Promise<CrownstoneCloud> {
  Error.stackTraceLimit = 100;

  let app = new CrownstoneCloud({
    rest: {port: 0},
    customPath: __dirname + "/../../src"
  });
  app.dataSource(testdb, 'testdb')
  await app.boot();
  app.bind('datasources.users').to(testdb);
  app.bind('datasources.data').to(testdb);
  await app.start();
  return app;
}

