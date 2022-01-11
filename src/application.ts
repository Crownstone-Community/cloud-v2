import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {CrownstoneSequence} from './sequence';
import {
  AuthenticationComponent,
  registerAuthenticationStrategy
} from '@loopback/authentication';
import {
  AuthorizationComponent,
} from '@loopback/authorization';
import {UserService} from './services';
import {AccessTokenStrategy} from "./security/authentication-strategies/access-token-strategy";
import {SecurityTypes} from "./config";
import {SphereAuthorizationComponent} from "./security/authorization-strategies/authorization";

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
}
const pkg: PackageInfo = require('../package.json');

export class CrownstoneCloud extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    let executionPath = __dirname;
    if (options.customPath !== undefined) { executionPath = options.customPath; }
    let customPort = process.env.PORT || 3050;
    if (options.rest && options.rest.port !== undefined) {
      customPort = options.rest.port;
    }

    let customHost = process.env.HOST || '127.0.0.1';
    if (options.rest && options.rest.host !== undefined) {
      customHost = options.rest.host;
    }

    super({...options, rest: { ...options.rest, port: customPort, host: customHost }})

    this.api({
      openapi: '3.0.0',
      info: {title: pkg.name, version: pkg.version},
      paths: {},
      components: {securitySchemes: {
        [SecurityTypes.accessToken]: {
          type: 'apiKey',
          in: 'header',
          name:'Authorization'
        },
      }},
      servers:  [{url: '/api'}],
      security: [{[SecurityTypes.accessToken]: []}],
    });


    this.setUpBindings();
    // Bind authentication component related elements
    this.component(AuthenticationComponent);
    this.component(AuthorizationComponent);
    this.component(SphereAuthorizationComponent);


    // authentication
    registerAuthenticationStrategy(this, AccessTokenStrategy);

    // Set up the custom sequence
    this.sequence(CrownstoneSequence);

    // Set up default home page
    this.static('/', path.join(executionPath, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({ path: '/explorer' });
    this.component(RestExplorerComponent);

    this.projectRoot = executionPath;

    // We define both here to allow the testing framework to generate coverage over the ts files.
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.ts','.controller.js'],
        nested: true,
      },
      repositories: {
        dirs: ['repositories'],
        extensions: ['.repository.ts','.repository.js'],
        nested: true,
      },
      datasources: {
        dirs: ['datasources'],
        extensions: ['.datasource.ts','.datasource.js'],
        nested: true,
      },
      services: {
        dirs: ['services'],
        extensions: ['.service.ts','.service.js'],
        nested: true,
      },
    };
  }

  setUpBindings(): void {
    this.bind("UserService").toClass(UserService);
  }
}
