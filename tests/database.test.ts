import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import {mockSSEmanager} from "./mocks/SSE";
mockSSEmanager();

import {makeUtilDeterministic, resetMockDatabaseIds, resetMockRandom} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createUser, resetUsers} from "./builders/createUserData";
import {Dbs} from "../src/modules/containers/RepoContainer";

let app    : CrownstoneCloud;
let client : Client;

beforeEach(async () => {
  await clearTestDatabase();
  resetUsers();
  resetMockRandom();
  resetMockDatabaseIds();
})
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })

test("Check updating a datafield", async () => {
  let dbs = getRepositories();
  let admin = await createUser('test@test.com', 'test', 1000);

  admin.updatedAt = new Date(20000);
  await dbs.user.update(admin, {acceptTimes: true})

  let updatedUser = await dbs.user.find()

  expect(updatedUser[0].updatedAt).toStrictEqual(new Date(20000))
})

test("Check inclusion resolver of device", async () => {
  let device = await Dbs.device.create({name:"bob", address:"testing"})
  let fingerprint = await Dbs.fingerprint.create({})

  await Dbs.appInstallation.create(  {deviceId: device.id, appName:'crownstone', deviceType:'ios'})
  await Dbs.devicePreferences.create({deviceId: device.id, property:"test",value:"myPreferences"})
  await Dbs.fingerprintLinker.create({deviceId: device.id, fingerprintId:fingerprint.id})

  let deviceIncluded = await Dbs.device.findById(device.id, {include: [
      {relation: 'installations'},
      {relation: 'preferences'},
      {relation: 'fingerprintLinks'},
    ]})

  expect(deviceIncluded.installations.length).toBe(1)
  expect(deviceIncluded.preferences.length).toBe(1)
  expect(deviceIncluded.fingerprintLinks.length).toBe(1)
})

test("Check create gridFS", async () => {
  console.log(JSON.stringify(await Dbs.fsFiles.create( {
        "id": "5ff88bda462ebd0004d859f4",
        "length": 223077,
        "chunkSize": 261120,
        "uploadDate": "2021-01-08T16:44:10.583Z",
        "md5": "d06e6e7bbea52887f26670165e2695ab",
        "filename": "58dcd2d7df42e8c330b5fd64.jpg",
        "contentType": "binary/octet-stream",
        "aliases": null,
        "metadata": {
          "container": "58dcd2d7df42e8c330b5fd64",
          "filename": "58dcd2d7df42e8c330b5fd64.jpg",
          "mimetype": "image/jpeg"
        }
      }
    ))
  )
})