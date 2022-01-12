import {Dbs} from "../containers/RepoContainer";
import {GridFsUtil} from "../../util/gridFsUtil";
import {AccessLevels, SphereAccess} from "../../models/sphere-access.model";
import path from "path";
import {Stone} from "../../models/stone.model";
import {StoneKey} from "../../models/stoneSubModels/stone-key.model";
import {getEncryptionKeys} from "../sync/helpers/KeyUtil";
import {Scene} from "../../models/scene.model";
import {Location} from "../../models/location.model";
var AdmZip = require("adm-zip");

export class DataDownloader {
  userId: string;
  zipFile: any;

  json : any = {};

  constructor(userId: string) {
    this.userId = userId;
    this.zipFile = new AdmZip();
  }

  async download() {
    try {
      // download the user data
      this.json.user = await Dbs.user.findById(this.userId);

      // get the user profile picture
      await this.addFile(this.json.user.profilePicId, 'Profile picture');

      // download all devices
      this.json.devices = await Dbs.device.find({
        where: {ownerId: this.userId },
        include: [
          {relation: 'installations'},
          {relation: 'preferences'},
          {relation: 'locationMap'},
          {relation: 'sphereMap'},
        ]});

      // download all fingerprints
      // this.json.fingerprints = await Dbs.fingerprint.find({where: {ownerId: this.userId}, fields: {phoneType: true}});
      // console.log(this.json.fingerprints.length)

      // download spehres (where member or admin)
      let spheresWithAccess : SphereAccess[] = await Dbs.sphereAccess.find({
        where: {
          and: [
            {userId: this.userId}, {invitePending: false}, {role: {inq:[AccessLevels.admin, AccessLevels.member]}}
          ]
        }, fields:{sphereId:true, role:true}});
      let sphereIds = spheresWithAccess.map((data) => { return data.sphereId; })
      let roles     = spheresWithAccess.map((data) => { return data.role; })

      this.json.spheres = await Dbs.sphere.find({where:{id:{inq: sphereIds}}});
      // get sphere contents
      for (let i = 0; i < this.json.spheres.length; i++) {
        let sphere = this.json.spheres[i];
        let roleInSphere = roles[i];
        let sphereId = sphere.id;

        // get scenes
        this.json.spheres[i].scenes = await Dbs.scene.find({where:{sphereId: sphereId}});
        // get custom images
        for (let scene of this.json.spheres[i].scenes) {
          if ((scene as Scene).customPictureId) {
            await this.addFile(scene.customPictureId, 'Scene custom images');
          }
        }

        // get stones
        this.json.spheres[i].stones = await Dbs.stone.find({where:{sphereId: sphereId}, include: [
            {relation:"behaviours"},
            {relation: 'abilities', scope: {include:[{relation:'properties'}]}},
            {relation:"switchStateHistory"},
            {relation:"currentSwitchState"},
        ]});

        // Adding keys to stone if the user is an admin.
        if (roleInSphere === 'admin') {
          let stoneIds = this.json.spheres[i].stones.map((stone: Stone) => { return stone.id; });
          let stoneKeys = await Dbs.stoneKeys.find({where:{stoneId:{inq:stoneIds}}});
          let mappedKeys : Record<string, StoneKey[]> = {};
          stoneKeys.forEach((key) => {
            if (!mappedKeys[key.stoneId]) {
              mappedKeys[key.stoneId] = [];
            }
            mappedKeys[key.stoneId].push(key);
          });
          for (let stone of this.json.spheres[i].stones) {
            stone.keys = stoneKeys[stone.id];
          }
        }

        // get locations
        this.json.spheres[i].locations = await Dbs.location.find({where:{sphereId: sphereId}});
        for (let location of this.json.spheres[i].locations) {
          if ((location as Location).imageId) {
            await this.addFile(location.imageId, 'Location custom images');
          }
        }

        // get hubs
        this.json.spheres[i].hubs = await Dbs.hub.find({where:{sphereId: sphereId}});;
        // get toons
        this.json.spheres[i].toons = await Dbs.toon.find({where:{sphereId: sphereId}});;
        // get sphere keys (you have access to)
        this.json.spheres[i].keys = await getEncryptionKeys(this.userId, sphereId, null, [spheresWithAccess[i]]);
        // get messages (sent by you)
        this.json.spheres[i].messages = await Dbs.message.find({where:{and: [{sphereId: sphereId},{ownerId: this.userId}]}});;
      }

      let stringifiedData = JSON.stringify(this.json, null, 2);

      this.zipFile.addFile("all_user_data.json", Buffer.from(stringifiedData, "utf8"))

      return this.zipFile.toBuffer()
    }
    catch (err) {
      console.log("ERROR", err)
    }
  }

  async addFile(fileId?: string, dirName?: string) {
    if (fileId) {
      try {
        let fileData = await GridFsUtil.downloadFileFromId(fileId);

        let filePath = fileData.meta.filename;
        if (dirName) { filePath = path.join(dirName, filePath); }

        filePath = filePath.split("?r=")[0];

        // add file directly
        this.zipFile.addFile(filePath, fileData.data, "entry comment goes here");
      }
      catch (err) {
        console.log("Cloud not get file.", err, dirName, fileId);
      }
    }
  }

}