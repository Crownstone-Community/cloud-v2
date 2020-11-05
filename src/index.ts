import {ApplicationConfig, ExpressServer} from './server';
import {PopulateRepositoryContainer} from "./modules/containers/RepoContainer";

export * from './server';

const config = {
  rest: {
    // Use the LB4 application as a route. It should not be listening.
    listenOnStart: false,
  },
};

export async function main(options: ApplicationConfig = {}) {

  const server = new ExpressServer(config);
  await server.boot();
  await server.start();

  await PopulateRepositoryContainer(server.lbApp);

  const port = server.lbApp.restServer.config.port ?? 3000;
  const host = server.lbApp.restServer.config.host ?? 'NO-HOST';

  console.log(`Server is running at ${host}:${port}`);

  return server.lbApp;
}

if (require.main === module) {
  // Run the application
  main({}).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
