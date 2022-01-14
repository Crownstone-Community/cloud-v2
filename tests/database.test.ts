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
