import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, getRepositories} from "./helpers";
import {createUser} from "./builders/createUserData";
import {CloudUtil} from "../src/util/CloudUtil";

let app    : CrownstoneCloud;
let client : Client;
let repos = getRepositories();

beforeEach(async () => { await clearTestDatabase(); })
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })

let email    = 'test@test.com';
let pass     = 'testPassword!';
let password = CloudUtil.hashPassword(pass);

test("test logging in with credentials.", async () => {
  await createUser(email, pass);

  let tokenData;
  await client.post("/user/login")
    .send({email, password})
    .expect(({body}) => { tokenData = body; })
    .expect(200);

  expect(await repos.crownstoneToken.find()).toHaveLength(1);
  let token = await repos.crownstoneToken.findOne();
  expect(token.id).toHaveLength(64)
});

test("test login injection robustness.", async () => {
  await createUser(email, pass);

  await client.post("/user/login")
    .send({email:{neq: "test"}, password})
    .expect(422);

  await client.post("/user/login")
    .send({email:JSON.stringify({neq: "test"}), password})
    .expect(422);

  expect(await repos.crownstoneToken.find()).toHaveLength(0);
});

test("test incorrect login", async () => {
  await createUser(email, pass);

  await client.post("/user/login").send({email: "bob@bob.com", password}).expect(401);
  await client.post("/user/login").send({email: email, password:"hi"}).expect(401);
  await client.post("/user/login").send({email: "bob@bob.com", password:"hi"}).expect(401);
});


test("test usage of token.", async () => {
  await createUser(email, pass);
  await client.post("/user/login").send({email, password}).expect(200);

  await client.get("/user/").expect(401);

  let token = await repos.crownstoneToken.findOne();
  await client.get(`/user/?access_token=${token.id}`)
    .expect(({body}) => {
      expect(body.password).toBeUndefined()
      expect(body.verificationToken).toBeUndefined()
      expect(body.earlyAccessLevel).toBeUndefined()
    })
    .expect(200);

  await client.get(`/user/?access_token=1234`).expect(401);
});

