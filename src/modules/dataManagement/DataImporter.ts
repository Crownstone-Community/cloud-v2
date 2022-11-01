import {Request, Response} from "express";
import crypto from "crypto";

import fs from 'fs'
import path from 'path'
import {Dbs} from "../containers/RepoContainer";
import {DefaultCrudRepository} from "@loopback/repository";
import {Device} from "../../models/device.model";
const AdmZip = require("adm-zip");

export class DataImporter {

  dataZipPath: string;
  dataExtractedPath: string;

  checkIfImportIsAllowed() : boolean {
    if (process.env.ALLOW_IMPORT !== "YES") {
      return false;
    }

    // Do not allow import if any of the database URLs are pointing at production.
    // Hardcoded as a security measure.

    // check if any of the database URLs are pointing at production.
    let isProduction = hash(process.env.DATA_DB_URL  || "") === "d16b95906548bb57d62c5357ebfe1e1a2c24f387" ||
                       hash(process.env.FILES_DB_URL || "") === "ea26ea0a303660c24c21605f2d7c4d8f0b3ca40a" ||
                       hash(process.env.USER_DB_URL  || "") === "f6e2ac1a5a67e32f1b55ff53e5a0ac7e80c204d6"
    console.log("checkIfImportIsAllowed", isProduction)
    return !isProduction;
  }

  async getFile(_req: any, res: Response, uploadPath: string) {
    this.dataZipPath = path.join(uploadPath,'tmp_data.zip');
    this.dataExtractedPath = path.join(uploadPath,'extracted');

    fs.existsSync(this.dataZipPath) && fs.unlinkSync(this.dataZipPath);

    let file = _req.file;
    if (file && file.path) {
      fs.renameSync(file.path, this.dataZipPath);
      let zip = new AdmZip(this.dataZipPath);
      zip.extractAllTo(this.dataExtractedPath, true);
      fs.existsSync(this.dataZipPath) && fs.unlinkSync(this.dataZipPath);
    }
  }


  async import(_req: Request, res: Response) {
    if (!this.dataExtractedPath) { return; }

    // crawl the extracted folder and import all files
    // the folder structure is:
    // this.dataExtractedPath / data /
    //        devices.json
    //        users.json
    //        fingerprints.json
    //        sphereAccess.json
    // this.dataExtractedPath / data / spheres /
    //        <sphere-name>.json
    // this.dataExtractedPath / data / spheres / <sphere-name>
    //       fingerprintsV2.json
    //       hubs.json
    //       keys.json
    //       locations.json
    //       scenes.json
    // this.dataExtractedPath / data / spheres / <sphere-name> / crownstones
    //       <crownstone-name>.json
    // this.dataExtractedPath / data / spheres / <sphere-name> / images / locations
    //       <imageId>.jpg
    // this.dataExtractedPath / data / spheres / <sphere-name> / images / scenes
    //       <imageId>.jpg
    let dataPath = path.join(this.dataExtractedPath, 'data');
    let devicesData      = JSON.parse(fs.readFileSync(path.join(dataPath, 'devices.json'), 'utf8'));
    let userData         = JSON.parse(fs.readFileSync(path.join(dataPath, 'user.json'), 'utf8'));
    let fingerprintsData = JSON.parse(fs.readFileSync(path.join(dataPath, 'fingerprints.json'), 'utf8'));
    let sphereAccessData = JSON.parse(fs.readFileSync(path.join(dataPath, 'sphereAccess.json'), 'utf8'));

    // add Devices to the DB
    for (let device of devicesData) {
      await create(Dbs.device, device);
      if (device.preferences) {
        for (let preference of device.preferences) {
          await create(Dbs.devicePreferences, preference);
        }
      }
      if (device.installations) {
        for (let installation of device.installations) {
          await create(Dbs.appInstallation, installation);
        }
      }
    }

    if (userData) {
      await create(Dbs.user, userData);
    }


    let spheresPath = path.join(dataPath, 'spheres');
    let spheres = fs.readdirSync(spheresPath);
    for (let i = 0; i < spheres.length; i++) {
      let sphereName = spheres[i];
      let spherePath = path.join(spheresPath, sphereName);
      let sphereData = JSON.parse(fs.readFileSync(path.join(spherePath, sphereName + '.json'), 'utf8'));
    }

  }


  cleanup() {
    fs.existsSync(this.dataZipPath) && fs.unlinkSync(this.dataZipPath);
    fs.existsSync(this.dataExtractedPath) && fs.rmdirSync(this.dataExtractedPath, { recursive: true });
  }

}

async function create(db : DefaultCrudRepository<any, any>, item: any) {
  try {
    await db.findById(item.id);
  }
  catch (err) {
    try {
      await db.create(item);
    }
    catch (err) {
      console.error("Error creating item", item, err);
    }
  }
}


function hash(text : string) : string {
  let shasum = crypto.createHash('sha1');
  shasum.update(String(text));
  let hashedPassword = shasum.digest('hex');
  return hashedPassword;
}
