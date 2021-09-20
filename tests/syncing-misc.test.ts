import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import {mockSSEmanager} from "./mocks/SSE";
mockSSEmanager();
import {SSEManager} from "../src/modules/sse/SSEManager";

import {makeUtilDeterministic, resetMockDatabaseIds, resetMockRandom} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createHub, createLocation, createSphere, createStone, createUser, resetUsers} from "./builders/createUserData";
import {auth, getToken, setAuthToUser} from "./rest-helpers/rest.helpers";
import {getEncryptionKeys} from "../src/modules/sync/helpers/KeyUtil";
import {CloudUtil} from "../src/util/CloudUtil";
import { mocked } from 'ts-jest/utils'
import {SyncHandler} from "../src/modules/sync/SyncHandler";

let app    : CrownstoneCloud;
let client : Client;

let dbs;
let admin;
let member;
let guest;
let sphere;
let hub;
let stone,  behaviour,  ability,  abilityProperty;
let stone2, behaviour2, ability2, abilityProperty2;
let stone3, behaviour3, ability3, abilityProperty3;
let location;
let token;

async function populate() {
  // fill with a bit of data for sync
  dbs = getRepositories();
  admin    = await createUser('test@test.com', 'test', 0);
  member   = await createUser('member@test.com', 'test', 0);
  guest    = await createUser('guest@test.com', 'test', 0);
  sphere   = await createSphere(admin.id, 'mySphere', 0);
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: member.id, role:'member', sphereAuthorizationToken: CloudUtil.createToken()});
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: guest.id, role:'guest', sphereAuthorizationToken: CloudUtil.createToken()});
  hub      = await createHub(sphere.id, 'myHub', 0);
  ({stone, behaviour, ability, abilityProperty} = await createStone(sphere.id, 'stone1', 0));
  ({stone: stone2, behaviour: behaviour2, ability: ability2, abilityProperty: abilityProperty2} = await createStone(sphere.id, 'stone2', 0));
  ({stone: stone3, behaviour: behaviour3, ability: ability3, abilityProperty: abilityProperty3} = await createStone(sphere.id, 'stone3', 0));
  location = await createLocation(sphere.id, 'location', 0);

  stone.locationId = location.id;
  await dbs.stone.update(stone)
  token  = await getToken(client, admin);
}

beforeEach(async () => {
  mocked(SSEManager.emit).mockReset();
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

test("get encryption keys", async () => {
  await populate();
  let adminKeys  = await getEncryptionKeys(admin.id);
  let memberKeys = await getEncryptionKeys(member.id);
  let guestKeys  = await getEncryptionKeys(guest.id);

  expect(adminKeys).toHaveLength(1);
  expect(adminKeys[0].sphereKeys).toHaveLength(7);
  expect(Object.keys(adminKeys[0].stoneKeys)).toHaveLength(3);
  expect(memberKeys).toHaveLength(1);
  expect(memberKeys[0].sphereKeys).toHaveLength(4);
  expect(Object.keys(memberKeys[0].stoneKeys)).toHaveLength(0);
  expect(guestKeys).toHaveLength(1);
  expect(guestKeys[0].sphereKeys).toHaveLength(3);
  expect(Object.keys(guestKeys[0].stoneKeys)).toHaveLength(0);
})


test("Sync FULL", async () => {
  await populate();
  await client.post(auth("/user/sync"))
    .expect(200)
    .send({sync: {type: "FULL"}})
    .expect(({body}) => {
      expect(body).toMatchSnapshot();
    })
});

test("Sync FULL with scope", async () => {
  await populate();
  let sphereId = sphere.id;


  await client.post(auth("/user/sync"))
    .send({sync: {type: "FULL", scope: ['spheres', 'hubs']}})
    .expect(({body}) => {
      expect(Object.keys(body)).toEqual(['spheres'])
      let sphere = body.spheres[sphereId];
      expect(Object.keys(sphere)).toEqual(['data', 'hubs'])
    })
})

test("Download users from sphere", async () => {
  await populate();
  let result = await SyncHandler.handleSync(admin.id, {sync: {type: "REQUEST"}, spheres: {[sphere.id]: {users:{member:{}, basic: {}, admin:{
    [admin.id]: {data: { updatedAt: admin.updatedAt},invitePending: false},
    ['hello']:  {data: { updatedAt: admin.updatedAt},invitePending: false},
  }}}}})

  expect(result.spheres[sphere.id].users.admin).toBeDefined()
  expect(result.spheres[sphere.id].users.admin[admin.id].data.status).toBe("IN_SYNC")
  expect(result.spheres[sphere.id].users.admin['hello'].data.status).toBe("NOT_AVAILABLE")
  expect(result.spheres[sphere.id].users.member[member.id].data.status).toBe("NEW_DATA_AVAILABLE")
})
