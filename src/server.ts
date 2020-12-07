import {once} from 'events';
import express, {Request, Response} from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { ApplicationConfig } from '@loopback/core';
import {CrownstoneCloud} from "./application";
import {SSEManager} from "./modules/sse/SSEManager";

export {ApplicationConfig};

export class ExpressServer {
  public readonly app: express.Application;
  public readonly lbApp: CrownstoneCloud;
  private server?: http.Server;

  constructor(options: ApplicationConfig = {}) {
    this.app = express();
    this.lbApp = new CrownstoneCloud(options);

    this.app.use(cors());

    // Expose the front-end assets via Express, not as LB4 route
    this.app.use('/api', this.lbApp.requestHandler);

    // Custom Express routes
    this.app.get('/', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    // Serve static files in the public folder
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  public async boot() {
    await this.lbApp.boot();
  }

  public async start() {
    await this.lbApp.start();
    const port = this.lbApp.restServer.config.port ?? 3000;
    this.server = this.app.listen(port);
    await once(this.server, 'listening');
    SSEManager.init(this.server);
  }

  // For testing purposes
  public async stop() {
    if (!this.server) return;
    await this.lbApp.stop();
    this.server.close();
    await once(this.server, 'close');
    this.server = undefined;
  }
}
