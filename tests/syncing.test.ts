import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createHub, createSphere, createUser} from "./builders/createUserData";
import {auth, getToken} from "./rest-helpers/rest.helpers";

let app    : CrownstoneCloud;
let client : Client;

beforeEach(async () => { await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);

})
afterAll(async () => { await app.stop(); })

test("AttemptSync", async () => {
  let user   = await createUser('test@test.com', 'test', 0);
  let sphere = await createSphere(user.id, 'mySphere', 0);
  let hub    = await createHub(sphere.id, 'myHub', 0);
  let repos  = getRepositories();
  let token  = await getToken(client);
  await client.get(auth("/user/sync")).expect(200).send({
    sync: {
      lastTime: new Date(0),
      full: false
    },
    user: {updatedAt: new Date(0)},
    spheres: {
      [sphere.id] :{
        sphere:    {updatedAt: new Date(0)},
        hubs: {
          [hub.id]: { hub: { updatedAt: new Date(0)}}}
        },
      }
  })


});