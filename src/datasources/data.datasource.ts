import {inject, lifeCycleObserver, ValueOrPromise} from '@loopback/core';
import {juggler, AnyObject} from '@loopback/repository';
import {CONFIG} from "../config";



const MongoDbConfig = {
  name: "mongo",
  connector: "mongodb",
  url: CONFIG.mongoURL,
  database: CONFIG.mongoDataDb,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectionTimeout: 10000,
  keepAlive: true,
  lazyConnect: true,
  normalizeUndefinedInQuery: 'nullify'
}


@lifeCycleObserver('datasource')
export class DataDatasource extends juggler.DataSource {
  static dataSourceName = 'data';

  constructor(
    @inject('datasources.config.mongo', {optional: true}) dsConfig: AnyObject = MongoDbConfig,
  ) {
    super(dsConfig);
  }

  /**
   * Disconnect the datasource when application is stopped. This allows the
   * application to be shut down gracefully.
   */
  stop(): ValueOrPromise<void> {
    return super.disconnect();
  }
}
