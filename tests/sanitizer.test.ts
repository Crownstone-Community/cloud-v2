import { advanceBy, advanceTo, clear } from "jest-date-mock";

import { CONFIG } from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;
CONFIG.unittesting = true;

import { mockSSEmanager } from "./mocks/SSE";
mockSSEmanager();

import {
  makeUtilDeterministic,
  resetMockDatabaseIds,
  resetMockRandom,
} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import { CrownstoneCloud } from "../src/application";
import { Client, createRestAppClient } from "@loopback/testlab";
import {
  clearTestDatabase,
  createApp,
  databaseDump,
  getRepositories,
} from "./helpers";
import {
  createMockSphereDatabase,
  resetUsers,
} from "./builders/createUserData";
import { DataSanitizer } from "../src/modules/dataManagement/Sanitizer";
import { Util } from "../src/util/Util";
import { getToken } from "./rest-helpers/rest.helpers";

let app: CrownstoneCloud;
let client: Client;

beforeEach(async () => {
  advanceTo(new Date("2022-01-01 12:00:00").valueOf()); // reset to timestamp
  await clearTestDatabase();
  resetUsers();
  resetMockRandom();
  resetMockDatabaseIds();
});
beforeAll(async () => {
  app = await createApp();
  client = createRestAppClient(app);
});
afterAll(async () => {
  await app.stop();
});

test("Before deleting users, check sanitation deletion counts", async () => {
  await createMockSphereDatabase(client, "sphere1");
  let sanitizer = new DataSanitizer();
  let result = await sanitizer.sanitize();
  expect(result).toMatchSnapshot()
});

test("Before deleting users, check if expired tokens are removed", async () => {
  let sphere = await createMockSphereDatabase(client, "sphere1");

  let initialDump = await databaseDump();
  advanceBy(15 * 24 * 3600 * 1000); // advance time by 15 days. Default TTL = 2 weeks
  await getToken(client, sphere.users.admin);

  let sanitizer = new DataSanitizer();
  await sanitizer.sanitize();
  let secondDump = await databaseDump();

  let diff = Util.whatHasBeenChanged(initialDump, secondDump);

  expect(diff.deleted.crownstoneToken).toMatchSnapshot();
  expect(diff.added.crownstoneToken).toMatchSnapshot();
});

test("Before deleting users, check if oauth tokens from missing users are removed", async () => {
  let sphere = await createMockSphereDatabase(client, "sphere1");
  let dbs = getRepositories();
  await dbs.oauthToken.create({
    appId: "appId",
    userId: "nonExisting",
    issuedAt: new Date(),
    refreshToken: "abcde",
  });
  await dbs.oauthToken.create({
    appId: "appId",
    userId: sphere.users.admin.id,
    issuedAt: new Date(),
    refreshToken: "abcde",
  });
  let initialDump = await databaseDump();
  let sanitizer = new DataSanitizer();
  await sanitizer.sanitize();
  let secondDump = await databaseDump();
  let diff = Util.whatHasBeenChanged(initialDump, secondDump);

  expect(diff.deleted.oauthToken).toMatchSnapshot();
});

test("Before deleting users, check if orphaned fingerprints are removed.", async () => {
  await createMockSphereDatabase(client, "sphere1");
  // let sphere2 = await createMockSphereDatabase(client, 'sphere2');

  let initialDump = await databaseDump();

  let sanitizer = new DataSanitizer();
  await sanitizer.sanitize();

  let secondDump = await databaseDump();
  let diff = Util.whatHasBeenChanged(initialDump, secondDump);

  expect(diff.deleted.fingerprint).toMatchSnapshot();
});

test("Before deleting users, check if unused files are removed.", async () => {
  await createMockSphereDatabase(client, "sphere1");
  // let sphere2 = await createMockSphereDatabase(client, 'sphere2');
  let initialDump = await databaseDump();

  let sanitizer = new DataSanitizer();
  let result = await sanitizer.sanitize();

  let secondDump = await databaseDump();
  let diff = Util.whatHasBeenChanged(initialDump, secondDump);

  expect(diff.deleted.fsFiles).toMatchSnapshot();
  expect(diff.deleted.fsChunks).toMatchSnapshot();
});
