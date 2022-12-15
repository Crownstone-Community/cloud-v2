import {Request, Response} from "express";
import crypto from "crypto";

import fs from 'fs'
import path from 'path'
import {Dbs} from "../containers/RepoContainer";
import {DefaultCrudRepository} from "@loopback/repository";
import {Device} from "../../models/device.model";
import {GridFsUtil} from "../../util/GridFsUtil";
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
    //        tokens.json
    //        firmwares.json
    //        bootloaders.json
    //        oauthTokens.json
    //        fingerprints.json
    //        sphereAccess.json
    // this.dataExtractedPath / data / spheres /
    //        <sphere-name>.json
    // this.dataExtractedPath / data / spheres / <sphere-name>
    //       fingerprintsV2.json
    //       hubs.json
    //       keys.json
    //       messages.json
    //       messageState.json
    //       messageDeletedByUser.json
    //       messageReadByUser.json
    //       messageRecipientUser.json
    //       messagesV2.json
    //       locations.json
    //       scenes.json
    // this.dataExtractedPath / data / spheres / <sphere-name> / crownstones
    //       <crownstone-name>.json
    // this.dataExtractedPath / data / spheres / <sphere-name> / images / locations
    //       <imageId>.jpg
    // this.dataExtractedPath / data / spheres / <sphere-name> / images / scenes
    //       <imageId>.jpg
    let dataPath = path.join(this.dataExtractedPath, 'data');

    // insert all firmwares
    await create(Dbs.firmware, readData(dataPath, 'firmwares.json'));
    // insert all bootloaders
    await create(Dbs.bootloader, readData(dataPath, 'bootloaders.json'));


    // insert all available crownstone access tokens.
    await create(Dbs.crownstoneToken, readData(dataPath, 'tokens.json'));

    // insert all available oauth tokens
    await create(Dbs.oauthToken, readData(dataPath, 'oauthTokens.json'));

    // add sphere access data to DB
    await create(Dbs.sphereAccess, readData(dataPath, 'sphereAccess.json'));

    // add users to the DB
    let userData = readData(dataPath, 'user.json', false);
    if (userData) {
      await create(Dbs.user, userData, [], 'importCreate');
      if (userData.profilePicId) {
        await storeFile(path.join(dataPath, 'user profile picture'), userData.profilePicId);
      }
    }

    // add old fingerprints to DB
    await create(Dbs.fingerprint, readData(dataPath, 'fingerprints.json'));

    // add Devices to the DB
    let devicesData = readData(dataPath, 'devices.json');
    for (let device of devicesData) {
      await create(Dbs.device, device, ['preferences','installations','fingerprintLinks']);
      await create(Dbs.devicePreferences, device.preferences);
      await create(Dbs.appInstallation,   device.installations);
      await create(Dbs.fingerprintLinker, device.fingerprintLinks);
    }


    let spheresPath = path.join(dataPath, 'spheres');
    let spheres = fs.readdirSync(spheresPath);
    for (let i = 0; i < spheres.length; i++) {
      let sphereName = spheres[i];
      let spherePath = path.join(spheresPath, sphereName);
      if (fs.statSync(spherePath).isFile()) { continue; }
      let sphereData = readData(spheresPath, sphereName + '.json')
      if (sphereData) {
        await create(Dbs.sphere, sphereData);
      }
      let keyData = readData(spherePath, 'keys.json')
      await create(Dbs.sphereKeys,    keyData.sphereKeys);
      await create(Dbs.location,      readData(spherePath, 'locations.json'));
      await create(Dbs.scene,         readData(spherePath, 'scenes.json'));
      await create(Dbs.fingerprintV2, readData(spherePath, 'fingerprintsV2.json'));

      await create(Dbs.message,              readData(spherePath, 'messages.json'));
      await create(Dbs.messageState,         readData(spherePath, 'messageState.json'));
      await create(Dbs.messageDeletedByUser, readData(spherePath, 'messageDeletedByUser.json'));
      await create(Dbs.messageReadByUser,    readData(spherePath, 'messageReadByUser.json'));
      await create(Dbs.messageRecipientUser, readData(spherePath, 'messageRecipientUser.json'));
      await create(Dbs.messageV2,            readData(spherePath, 'messagesV2.json'));

      let crownstonesPath = path.join(spherePath, 'crownstones');
      let crownstonesDir = fs.readdirSync(crownstonesPath);
      for (let j = 0; j < crownstonesDir.length; j++) {
        let crownstoneName = crownstonesDir[j];
        let crownstoneData = readData(crownstonesPath, crownstoneName, false);
        if (crownstoneData) {
          await create(Dbs.stone, crownstoneData, ['behaviours','abilities','switchStateHistory','energyData','energyDataProcessed','energyMetaData','keys']);
          await create(Dbs.stoneBehaviour, crownstoneData.behaviours);
          await create(Dbs.stoneAbility,   crownstoneData.abilities, ['properties']);
          for (let ability of (crownstoneData.abilities ?? [])) {
            await create(Dbs.stoneAbilityProperty, ability.properties);
          }
          await create(Dbs.stoneSwitchState,     crownstoneData.switchStateHistory);
          await create(Dbs.stoneEnergy,          crownstoneData.energyData);
          await create(Dbs.stoneEnergyProcessed, crownstoneData.energyDataProcessed);
          await create(Dbs.stoneEnergyMetaData,  crownstoneData.energyMetaData);
          await create(Dbs.stoneKeys,            crownstoneData.keys);
        }
      }

      await create(Dbs.hub,           readData(spherePath, 'hubs.json'));

      // iterate over the location images folder
      let locationImagesPath = path.join(spherePath, 'images', 'locations');
      if (fs.existsSync(locationImagesPath)) {
        let locationImagesDir = fs.readdirSync(locationImagesPath);
        for (let j = 0; j < locationImagesDir.length; j++) {
          let imageId = locationImagesDir[j];
          await storeFile(locationImagesPath, imageId.split('.')[0]);
        }
      }

      // iterate over the scene images folder
      let sceneImagesPath = path.join(spherePath, 'images', 'scenes');
      if (fs.existsSync(sceneImagesPath)) {
        let sceneImagesDir = fs.readdirSync(sceneImagesPath);
        for (let j = 0; j < sceneImagesDir.length; j++) {
          let imageId = sceneImagesDir[j];
          await storeFile(sceneImagesPath, imageId.split('.')[0]);
        }
      }
    }

    await this.cleanup();
    console.log("Finished import!")
  }


  cleanup() {
    fs.existsSync(this.dataZipPath) && fs.unlinkSync(this.dataZipPath);
    fs.existsSync(this.dataExtractedPath) && fs.rmdirSync(this.dataExtractedPath, { recursive: true });
  }

}


async function create(db : DefaultCrudRepository<any, any>, itemData: any[] | any | undefined, deleteFieldsForInsertion: string[] = [], customCreateMethodString?: string) {
  if (!itemData) { return; }

  async function _create(item: any) {
    let itemCopy = {...item};
    for (let field of deleteFieldsForInsertion) {
      delete itemCopy[field];
    }

    try {
      await db.findById(itemCopy.id);
    }
    catch (err) {
      try {
        if (customCreateMethodString) {
          // @ts-ignore
          await db[customCreateMethodString](itemCopy);
        }
        else {
          await db.create(itemCopy);
        }
      }
      catch (err) {
        console.error("Error creating item", itemCopy, err);
      }
    }
  }

  if (!Array.isArray(itemData)) {
    itemData = [itemData];
  }

  for (let item of itemData) {
    await _create(item);
  }
}


function hash(text : string) : string {
  let shasum = crypto.createHash('sha1');
  shasum.update(String(text));
  let hashedPassword = shasum.digest('hex');
  return hashedPassword;
}


function readData(dataPath: string, filename: string, isArray = true) : any {
  let filePath = path.join(dataPath, filename);
  let returnDefault = isArray ? [] : {};

  if (!fs.existsSync(filePath)) { console.log(filePath, "Does not exist"); return returnDefault; }
  let data = fs.readFileSync(filePath, 'utf8');
  if (!data) { console.log("No data"); return returnDefault; }

  try {
    return JSON.parse(data);
  }
  catch (err: any) {
    console.error("Error parsing file", filePath, err);
    throw err;
  }
}

async function storeFile(dataPath: string, fileBaseName: string) {
  if (!fs.existsSync(dataPath)) { return; }
  let metaPath = path.join(dataPath, fileBaseName + '.json');
  let chunksPath = path.join(dataPath, fileBaseName + '_chunks.json');

  if (!fs.existsSync(metaPath)) { return; }
  if (!fs.existsSync(chunksPath)) { return; }
  let metaData = readData(dataPath, fileBaseName + '.json', false);
  let chunksData = readData(dataPath, fileBaseName + '_chunks.json');

  if (!chunksData) { return; }
  if (!metaData) { return; }

  await GridFsUtil.storeFile(chunksData, metaData);
}


function findFile(dataPath: string, partialFilename: string, ignoreExtension = 'json') : string {
  if (!fs.existsSync(dataPath)) { throw new Error("No path"); }
  // loop over all files in folder
  let files = fs.readdirSync(dataPath);
  for (let i = 0; i < files.length; i++) {
    let filename = files[i];
    if (filename.indexOf(partialFilename) !== -1 && filename.indexOf(ignoreExtension) === -1) {
      return filename;
    }
  }
  throw new Error("No file found");
}

