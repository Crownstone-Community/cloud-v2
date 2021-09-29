import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import {mockSSEmanager} from "./mocks/SSE";
mockSSEmanager();
import {SSEManager} from "../src/modules/sse/SSEManager";

import {makeUtilDeterministic, resetMockDatabaseIds, resetMockRandom, setDate} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createHub, createLocation, createSphere, createStone, createUser, resetUsers} from "./builders/createUserData";
import {auth, getToken} from "./rest-helpers/rest.helpers";
import {getEncryptionKeys} from "../src/modules/sync/helpers/KeyUtil";
import {CloudUtil} from "../src/util/CloudUtil";
import { mocked } from 'ts-jest/utils'
import {Dbs} from "../src/modules/containers/RepoContainer";

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
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: member.id, role:'member', sphereAuthorizationToken: CloudUtil.createToken(), invitePending: false});
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
  expect(memberKeys).toHaveLength(1);
  expect(memberKeys[0].sphereKeys).toHaveLength(4);
  expect(guestKeys).toHaveLength(1);
  expect(guestKeys[0].sphereKeys).toHaveLength(3);
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


test("Request sync users from sphere", async () => {
  await populate();
  let payload = {sync: {type: "REQUEST"}, spheres: {[sphere.id]: {
    users:{
      [admin.id]:  {data: { updatedAt: admin.updatedAt}},
      [member.id]: {data: { updatedAt: member.updatedAt}},
      ['hello']:   {data: { updatedAt: admin.updatedAt}},
    }
  }}};

  await client.post(auth("/user/sync"))
    .send(payload)
    .expect(({body: result}) => {
      let userInResponse = result.spheres[sphere.id].users;
      expect(userInResponse).toBeDefined()
      expect(userInResponse[admin.id].data.status).toBe("IN_SYNC")
      expect(userInResponse[member.id].data.status).toBe("IN_SYNC")
      expect(userInResponse['hello'].data.status).toBe("NOT_AVAILABLE")
      expect(userInResponse[guest.id].data.status).toBe("NEW_DATA_AVAILABLE")
      expect(userInResponse[guest.id].data.data.invitePending).toBeFalsy();
      expect(userInResponse[guest.id].data.data.accessLevel).toBe('guest');
    })

  // move forward in time and change the member user
  setDate(1e7)
  member.firstName = "bob";
  await Dbs.user.update(member);

  await client.post(auth("/user/sync"))
    .send(payload)
    .expect(({body: result}) => {
      let userInResponse = result.spheres[sphere.id].users;
      expect(userInResponse[member.id].data.status).toBe("NEW_DATA_AVAILABLE")
    })

  let payload2 = {sync: {type: "REQUEST"}, spheres: {[sphere.id]: {
    users:{
      [member.id]: {data: { updatedAt: new Date(1e7) }},
    }
  }}};

  await client.post(auth("/user/sync"))
    .send(payload2)
    .expect(({body: result}) => {
      let userInResponse = result.spheres[sphere.id].users;
      expect(userInResponse[member.id].data.status).toBe("IN_SYNC");
    })

  // move forward in time and change the member user's role in the sphere to admin
  setDate(2e7)
  let accessData = await Dbs.sphereAccess.find({where: {userId: member.id}});
  accessData[0].role = "admin"
  await Dbs.sphereAccess.update(accessData[0])

  await client.post(auth("/user/sync"))
    .send(payload2)
    .expect(({body: result}) => {
      let userInResponse = result.spheres[sphere.id].users;
      expect(userInResponse[member.id].data.status).toBe("NEW_DATA_AVAILABLE");
    })


  let payload3 = {sync: {type: "REQUEST"}, spheres: {[sphere.id]: {
    users:{
      [member.id]: {data: { updatedAt: new Date(2e7) }},
    }
  }}};

  // move forward in time and change the member user's invitation status
  setDate(3e7)
  accessData = await Dbs.sphereAccess.find({where: {userId: member.id}});
  accessData[0].invitePending = true;
  await Dbs.sphereAccess.update(accessData[0])

  await client.post(auth("/user/sync"))
    .send(payload3)
    .expect(({body: result}) => {
      let userInResponse = result.spheres[sphere.id].users;
      expect(userInResponse[member.id].data.status).toBe("NEW_DATA_AVAILABLE");
    })
})
