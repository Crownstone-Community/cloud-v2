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
import {auth, getToken} from "./rest-helpers/rest.helpers";
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


test("Test request data phase", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' as SyncType },
    spheres: {
      [sphere.id]: {
        stones: {
          [stone.id]: {data: {updatedAt: 2000}}
        }
      }
    }
  }
  await client.post(auth("/user/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones[stone.id].data.status).toBe("REQUEST_DATA");
      expect(body.spheres[sphere.id].stones[stone.id].data.data).toBeDefined();
    })

  let initialStoneRef = await dbs.stone.findById(stone.id);
  expect(initialStoneRef.name).toBe("stone1");

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

  await client.post(auth("/user/sync")).send(replyPhaseRequest)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones[stone.id].data.status).toBe("UPDATED_IN_CLOUD");
    })
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(1);
  expect(mocked(SSEManager.emit).mock.calls[0][0]).toStrictEqual(
    {
      type:'dataChange',
      subType:'stones',
      operation:'update',
      sphere: {
        id:'dbId:SphereRepository:1',
        name:'mySphere',
        uid: 212
      },
      changedItem: {
        id: "dbId:StoneRepository:1",
        name: 'AWESOME',
      }
    })

  let stoneRef = await dbs.stone.findById(stone.id);
  expect(stoneRef.name).toBe("AWESOME");
  expect(stoneRef.locationId).toBe(location.id);
  expect(new Date(stoneRef.updatedAt).valueOf()).toBe(2000);
});



test("Test request data phase with value removal", async () => {
  await populate();

  let replyPhaseRequest = {
    sync: { type: 'REPLY' as SyncType },
    spheres: {
      [sphere.id]: {
        stones: {
          [stone.id]: {data: {locationId: null, updatedAt: 2000}}
        }
      }
    }
  }

  await client.post(auth("/user/sync")).send(replyPhaseRequest)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones[stone.id].data.status).toBe("UPDATED_IN_CLOUD");
    })
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(1);

  let stoneRef = await dbs.stone.findById(stone.id);
  expect(stoneRef.locationId).toBe(null);
  expect(new Date(stoneRef.updatedAt).valueOf()).toBe(2000);
});


test("Test request data location update", async () => {
  await populate();

  let replyPhaseRequest = {
    sync: { type: 'REPLY' as SyncType },
    spheres: {
      [sphere.id]: {
        locations: {
          [location.id]: {data: {name:"Fred", updatedAt: 2000}}
        }
      }
    }
  }

  await client.post(auth("/user/sync")).send(replyPhaseRequest)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].locations[location.id].data.status).toBe("UPDATED_IN_CLOUD");
    })

  // check for the update event.
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(1);

  let locationRef = await dbs.location.findById(location.id);
  expect(locationRef.name).toBe('Fred');
  expect(new Date(locationRef.updatedAt).valueOf()).toBe(2000);


});
