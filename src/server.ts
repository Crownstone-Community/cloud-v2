import {once} from 'events';
import express, {Request, Response} from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import { ApplicationConfig } from '@loopback/core';
import {CrownstoneCloud} from "./application";
import {SSEManager} from "./modules/sse/SSEManager";
import {DataSanitizer} from "./modules/dataManagement/Sanitizer";
import {AggegateAllSpheres} from "./modules/energy/EnergyProcessor";
import {DataGarbageCollection} from "./modules/dataManagement/DataGarbageCollection";
import {DataImporter} from "./modules/dataManagement/DataImporter";

const multer = require("multer");
const uploadPath = `${__dirname}/../private/`;
const upload = multer({ dest: uploadPath });

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
    this.app.get('/sanitize-database', async function (_req: Request, res: Response) {
      if (_req.query.token === process.env.SANITATION_TOKEN) {
        res.write("Processing...\n")
        let result = await DataSanitizer.sanitize()
        res.write("Removed the following data:\n")
        return res.end(JSON.stringify(result, null, 2));
      }
      res.end("INVALID_TOKEN");
    });
    this.app.get('/aggregate-energy-data', async function (_req: Request, res: Response) {
      if (_req.query.token === process.env.AGGREGATION_TOKEN) {
        res.write("Processing...\n")

        let force = _req.query.force === "true";
        if (force) {
          res.write("Forcing aggregation...\n")
        }
        let result = await AggegateAllSpheres(force);
        res.write("Done\n")
        return res.end(JSON.stringify(result, null, 2));
      }
      res.end("INVALID_TOKEN");
    });
    this.app.get('/garbage-collect-data', async function (_req: Request, res: Response) {
      if (_req.query.token === process.env.AGGREGATION_TOKEN) {
        res.write("Processing...\n")
        let result = await DataGarbageCollection();
        res.write("Removed the following data:\n")
        return res.end(JSON.stringify(result, null, 2));
      }
      res.end("INVALID_TOKEN");
    });

    // Custom Express routes
    this.app.get('/', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    this.app.get('/hi', function (_req: Request, res: Response) {
      res.end(JSON.stringify({hi: "v2"}));
    });

    this.app.get('/import-data', async  function (_req: Request, res: Response) {
      let importer = new DataImporter();
      try {
        if (importer.checkIfImportIsAllowed()) {
          res.sendFile(path.join(__dirname, '../public/import-data.html'));
        }
        else {
          res.end("Import is not allowed on any of the production databases.");
        }
      }
      catch (err : any) {
        res.end("Error: " + err);
      }
    });

    this.app.post('/import-data', upload.single('file'), async function (_req: Request, res: Response) {
      let importer = new DataImporter();
      try {
        if (importer.checkIfImportIsAllowed()) {
          await importer.getFile(_req, res, uploadPath);
          await importer.import(_req, res);

          res.end("DONE")
        }
        else {
          res.end("Import is not allowed on any of the production databases.");
        }
      }
      catch (err : any) {
        res.end("Error: " + err);
      }
    });

    // Custom Express routes
    this.app.get('/user-data', function (_req: Request, res: Response) {
      res.sendFile(path.join(__dirname, '../public/user-data.html'));
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
