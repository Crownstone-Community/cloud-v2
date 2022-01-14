import {CrownstoneCloud} from "../../src/application";
import {testdb} from "../fixtures/datasources/testdb.datasource";
import {PopulateRepositoryContainer} from "../../src/modules/containers/RepoContainer";

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
  app.bind('datasources.files').to(testdb);
  await app.start();
  PopulateRepositoryContainer(app);
  return app;
}

