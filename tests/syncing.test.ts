import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import {makeUtilDeterministic, restMockRandom} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createHub, createLocation, createSphere, createStone, createUser} from "./builders/createUserData";
import {auth, getToken} from "./rest-helpers/rest.helpers";

let app    : CrownstoneCloud;
let client : Client;

beforeEach(async () => { await clearTestDatabase(); restMockRandom(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);

})
afterAll(async () => { await app.stop(); })

test("Sync Full", async () => {
  let dbs = getRepositories();
  let user     = await createUser('test@test.com', 'test', 0);
  let sphere   = await createSphere(user.id, 'mySphere', 5);
  let hub      = await createHub(sphere.id, 'myHub', 2);
  let stone    = await createStone(sphere.id, 'stone1', 0);
  let stone2   = await createStone(sphere.id, 'stone2', 0);
  let stone3   = await createStone(sphere.id, 'stone3', 0);
  let location = await createLocation(sphere.id, 'location', 0);

  stone.locationId = location.id;
  await dbs.stone.update(stone)

  let repos   = getRepositories();

  let token  = await getToken(client);

  await client.post(auth("/user/sync")).expect(200).send({
    sync: {
      type:"FULL",
    },
  }).expect(
    ({body}) => {
    console.log(JSON.stringify(body))
  })
  // await client.post(auth("/user/sync")).send({
  //   sync: {
  //     type:"REQUEST",
  //   },
  //   user:{},
  //   spheres:{'dbId:SphereRepository:1':{}}
  // }).expect(
  //   ({body}) => {
  //
  // })

});