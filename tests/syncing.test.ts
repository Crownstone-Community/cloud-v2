import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createHub, createSphere, createUser} from "./builders/createUserData";

let app    : CrownstoneCloud;
let client : Client;

beforeEach(async () => { await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })

test("AttemptSync", async () => {
  let user   = await createUser('test@test.com', 0);
  let sphere = await createSphere(user.id, 'mySphere', 0);
  let hub    = await createHub(sphere.id, 'myHub', 0);

  let repos = getRepositories();


  // await client.get("/users/sync").expect(401)
});