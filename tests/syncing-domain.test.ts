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
import {CloudUtil} from "../src/util/CloudUtil";
import { mocked } from 'ts-jest/utils'

let app    : CrownstoneCloud;
let client : Client;

let dbs;
let admin;
let member;
let guest;
let sphere, sphere2;
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
  sphere2  = await createSphere(admin.id, 'SecondSphere', 0);
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


test("Sync sphere users for a single sphere.", async () => {
  await populate();

  let sphereId = sphere.id;
  // normal sync should get both spheres
  await client.post(auth(`/sync`)).send({sync: {type: "FULL", scope: ['sphereUsers']}})
    .expect(({body}) => {
      expect(Object.keys(body.spheres).length).toBe(2)
    })
  // normal sync should get both spheres
  await client.post(auth(`/sync`)).send({sync: {type: "REQUEST", scope: ['sphereUsers']}})
    .expect(({body}) => {
      expect(Object.keys(body.spheres).length).toBe(2)
    })

  // only get sphere1
  await client.post(auth(`/spheres/${sphereId}/sync`)).send({sync: {type: "FULL", scope: ['sphereUsers']}})
    .expect(({body}) => {
      expect(Object.keys(body.spheres).length).toBe(1)
      expect(Object.keys(body.spheres[sphereId]).length).toBe(1)
      expect(body.spheres[sphereId].users[admin.id]).toBeDefined()
      expect(body.spheres[sphereId].users[member.id]).toBeDefined()
      expect(body.spheres[sphereId].users[guest.id]).toBeDefined()
    })

  // only get sphere2
  await client.post(auth(`/spheres/${sphere2.id}/sync`)).send({sync: {type: "FULL", scope: ['sphereUsers']}})
    .expect(({body}) => {
      expect(Object.keys(body.spheres).length).toBe(1)
      expect(Object.keys(body.spheres[sphere2.id]).length).toBe(1);
      expect(body.spheres[sphere2.id].users[admin.id]).toBeDefined();
      expect(body.spheres[sphere2.id].users[member.id]).toBeUndefined();
      expect(body.spheres[sphere2.id].users[guest.id]).toBeUndefined();
    })

  // REQUEST should also get 1 sphere
  await client.post(auth(`/spheres/${sphereId}/sync`)).send({sync: {type: "REQUEST", scope: ['sphereUsers']}})
    .expect(({body}) => {
      expect(Object.keys(body.spheres).length).toBe(1)
      expect(Object.keys(body.spheres[sphereId]).length).toBe(1)
      expect(body.spheres[sphereId].users[admin.id]).toBeDefined()
      expect(body.spheres[sphereId].users[member.id]).toBeDefined()
      expect(body.spheres[sphereId].users[guest.id]).toBeDefined()
    })
});

test("Sync abilities in single crownstone.", async () => {
  await populate();

  let stoneId = stone.id;

  // only get sphere1
  await client.post(auth(`/stones/${stoneId}/sync`)).send({sync: {type: "FULL", scope: ['stones']}})
    .expect(({body}) => {
      expect(Object.keys(body.spheres[sphere.id]).length).toBe(1);
      expect(Object.keys(body.spheres[sphere.id].stones).length).toBe(1);
      expect(body.spheres[sphere.id].stones[stone.id]).toBeDefined();
      expect(body.spheres[sphere.id].stones[stone2.id]).toBeUndefined();
    })

});
