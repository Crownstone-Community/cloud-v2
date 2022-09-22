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
import {SyncHandler} from "../src/modules/sync/SyncHandler";
import {getEncryptionKeys} from "../src/modules/sync/helpers/KeyUtil";
import {CloudUtil} from "../src/util/CloudUtil";
import { mocked } from 'ts-jest/utils'

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

test("Test request data without permission", async () => {
  await populate();
  await setAuthToUser(client, guest)
  let replyPhaseRequest = {
    sync: { type: 'REPLY' as SyncType },
    spheres: {
      [sphere.id]: {
        stones: {
          [stone.id]: {data: {name: "AWESOME", updatedAt: 2000}}
        }
      }
    }
  }

  await client.post(auth("/sync")).send(replyPhaseRequest)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones[stone.id].data.status).toBe("ACCESS_DENIED");
    })

  let stoneRef = await dbs.stone.findById(stone.id);
  expect(stoneRef.name).toBe("stone1");
  expect(new Date(stoneRef.updatedAt).valueOf()).toBe(0);
});

test("Check if we can't alter other people's spheres", async () => {
  await populate();
  let user2    = await createUser("frank@gmail.com", 'mySphere', 0);

  let request = {
    sync: {type: 'REQUEST' as SyncType},
    spheres: {
      [sphere.id]: {
        data: {updatedAt: new Date(50)}
      }
    }
  }
  let reply = {
    sync: {type: 'REPLY' as SyncType},
    spheres: {
      [sphere.id]: {
        data: {name:"Pirates!", updatedAt: new Date(50)}
      }
    }
  }

  await setAuthToUser(client, user2)
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].data.status).toBe("NOT_AVAILABLE");
    })
  await client.post(auth("/sync")).send(reply)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].data.status).toBe("ACCESS_DENIED");
    })


})























