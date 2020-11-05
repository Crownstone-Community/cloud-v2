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

let email = 'test@test.com';
let password = 'testPassword';

test("test logging in.", async () => {
  await createUser(email, password);
  let repos = getRepositories();

  let tokenData;
  await client.post("/users/login")
    .send({email, password})
    .expect(({body}) => { tokenData = body; })
    .expect(200);

  expect(await repos.crownstoneToken.find()).toHaveLength(1)
});

test("test login injection robustness.", async () => {
  await createUser(email, password);
  let repos = getRepositories();

  let tokenData;
  await client.post("/users/login")
    .send({email:{neq: "test"}, password})
    .expect(422);

  await client.post("/users/login")
    .send({email:JSON.stringify({neq: "test"}), password})
    .expect(422);

  expect(await repos.crownstoneToken.find()).toHaveLength(0)
});