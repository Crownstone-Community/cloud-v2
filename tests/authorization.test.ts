import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import {makeUtilDeterministic, resetMockDatabaseIds, resetMockRandom, setDate} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createHub, createLocation, createSphere, createStone, createUser} from "./builders/createUserData";
import {CloudUtil} from "../src/util/CloudUtil";
import {auth, getHubToken, getToken, login} from "./rest-helpers/rest.helpers";
import {Dbs} from "../src/modules/containers/RepoContainer";

let app    : CrownstoneCloud;
let client : Client;
let repos = getRepositories();

beforeEach(async () => { await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })

let dbs;
let admin, admin2;
let member, member2;
let guest, guest2;
let sphere, sphere2;
let hub, hub2;
let stone,  behaviour,  ability,  abilityProperty;
let stone2, behaviour2, ability2, abilityProperty2;
let stone3, behaviour3, ability3, abilityProperty3;
let location;
let adminToken
let memberToken
let guestToken
let hubToken
let adminToken2
let memberToken2
let guestToken2
let hubToken2
let invalidToken

async function populate() {
  // fill with a bit of data for sync
  dbs = getRepositories();
  admin    = await createUser('test@test.com', 'test', 0);
  member   = await createUser('member@test.com', 'test', 0);
  guest    = await createUser('guest@test.com', 'test', 0);
  admin2   = await createUser('test2@test.com', 'test', 0);
  member2  = await createUser('member2@test.com', 'test', 0);
  guest2   = await createUser('gues2t@test.com', 'test', 0);
  sphere   = await createSphere(admin.id, 'mySphere', 0);
  sphere2  = await createSphere(admin2.id, 'mySphere2', 0);
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: member.id, role:'hub', sphereAuthorizationToken: CloudUtil.createToken(), invitePending: false});
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: member.id, role:'member', sphereAuthorizationToken: CloudUtil.createToken(), invitePending: false});
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: guest.id, role:'guest', sphereAuthorizationToken: CloudUtil.createToken()});
  await dbs.sphereAccess.create({sphereId: sphere2.id, userId: member2.id, role:'member', sphereAuthorizationToken: CloudUtil.createToken(), invitePending: false});
  await dbs.sphereAccess.create({sphereId: sphere2.id, userId: guest2.id, role:'guest', sphereAuthorizationToken: CloudUtil.createToken()});
  hub      = await createHub(sphere.id, 'myHub', 0);
  hub2     = await createHub(sphere2.id, 'myHub', 0);
  ({stone, behaviour, ability, abilityProperty} = await createStone(sphere.id, 'stone1', 0));
  ({stone: stone2, behaviour: behaviour2, ability: ability2, abilityProperty: abilityProperty2} = await createStone(sphere.id, 'stone2', 0));
  ({stone: stone3, behaviour: behaviour3, ability: ability3, abilityProperty: abilityProperty3} = await createStone(sphere.id, 'stone3', 0));
  location = await createLocation(sphere.id, 'location', 0);

  stone.locationId = location.id;
  await dbs.stone.update(stone)

  adminToken   = await getToken(client, admin);
  memberToken  = await getToken(client, member);
  guestToken   = await getToken(client, guest);
  adminToken2  = await getToken(client, admin2);
  memberToken2 = await getToken(client, member2);
  guestToken2  = await getToken(client, guest2);
  hubToken     = await getHubToken(client, hub);
  hubToken2    = await getHubToken(client, hub2);
  invalidToken = "abcde";
}



test("test access to sync", async () => {
  await populate();

  await client.post(auth("/sync", adminToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth("/sync", memberToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth("/sync", guestToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth("/sync", hubToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth("/sync", invalidToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(401)})
});

test("test access to sphereSync by people in the sphere", async () => {
  await populate();

  await client.post(auth(`/spheres/${sphere.id}/sync`, adminToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth(`/spheres/${sphere.id}/sync`, memberToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth(`/spheres/${sphere.id}/sync`, guestToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
  await client.post(auth(`/spheres/${sphere.id}/sync`, hubToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(400)})
});

test("test access to sphereSync by people NOT in the sphere", async () => {
  await populate();

  await client.post(auth(`/spheres/${sphere.id}/sync`, adminToken2)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/spheres/${sphere.id}/sync`, memberToken2)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/spheres/${sphere.id}/sync`, guestToken2)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/spheres/${sphere.id}/sync`, hubToken2)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(403)})

  await client.post(auth(`/spheres/${sphere2.id}/sync`, adminToken)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/spheres/${sphere2.id}/sync`, memberToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/spheres/${sphere2.id}/sync`, guestToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/spheres/${sphere2.id}/sync`, hubToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(403)})

  await client.post(auth(`/spheres/${sphere.id}/sync`, invalidToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(401)})
  await client.post(auth(`/spheres/${sphere2.id}/sync`, invalidToken)).send({}).expect(({body}) => {expect(body.error.statusCode).toBe(401)})
});

test("test access to stoneSync", async () => {
  await populate();

  await client.post(auth(`/stones/${stone.id}/sync`, adminToken2)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/stones/${stone.id}/sync`, memberToken2)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/stones/${stone.id}/sync`, guestToken2)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.post(auth(`/stones/${stone.id}/sync`, hubToken2)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(403)})

  await client.post(auth(`/stones/${stone.id}/sync`, adminToken)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(400)})
  await client.post(auth(`/stones/${stone.id}/sync`, memberToken)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(400)})
  await client.post(auth(`/stones/${stone.id}/sync`, guestToken)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(400)})
  await client.post(auth(`/stones/${stone.id}/sync`, hubToken)).send({}).expect(({body}) => { expect(body.error.statusCode).toBe(400)})
});

test("test access to stoneDelete", async () => {
  await populate();

  await client.del(auth(`/stones/${stone.id}/`, adminToken2)).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.del(auth(`/stones/${stone.id}/`, memberToken2)).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.del(auth(`/stones/${stone.id}/`, guestToken2)).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.del(auth(`/stones/${stone.id}/`, hubToken2)).expect(({body}) => { expect(body.error.statusCode).toBe(403)})

  await client.del(auth(`/stones/${stone.id}/`, memberToken)).expect(({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.del(auth(`/stones/${stone.id}/`, guestToken)).expect( ({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.del(auth(`/stones/${stone.id}/`, hubToken)).expect(   ({body}) => { expect(body.error.statusCode).toBe(403)})
  await client.del(auth(`/stones/${stone.id}/`, adminToken)).expect( ({body}) => { expect(body).toStrictEqual({})})
});


