import { CONFIG } from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import { mockSSEmanager } from "./mocks/SSE";
mockSSEmanager();
import { SSEManager } from "../src/modules/sse/SSEManager";

import {
  makeUtilDeterministic,
  resetMockDatabaseIds,
  resetMockRandom,
  setDate,
} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import { CrownstoneCloud } from "../src/application";
import { Client, createRestAppClient } from "@loopback/testlab";
import { clearTestDatabase, createApp, getRepositories } from "./helpers";
import {
  createHub,
  createLocation,
  createSphere,
  createStone,
  createUser,
  resetUsers,
} from "./builders/createUserData";
import { auth, getToken } from "./rest-helpers/rest.helpers";
import { CloudUtil } from "../src/util/CloudUtil";
import { mocked } from "ts-jest/utils";
import { Dbs } from "../src/modules/containers/RepoContainer";

let app: CrownstoneCloud;
let client: Client;

let dbs;
let admin;
let member;
let guest;
let sphere;
let hub;
let stone, behaviour, ability, abilityProperty;
let stone2, behaviour2, ability2, abilityProperty2;
let stone3, behaviour3, ability3, abilityProperty3;
let location;
let token;

async function populate() {
  // fill with a bit of data for sync
  dbs = getRepositories();
  admin = await createUser("test@test.com", "test", 0);
  member = await createUser("member@test.com", "test", 0);
  guest = await createUser("guest@test.com", "test", 0);
  sphere = await createSphere(admin.id, "mySphere", 0);
  await dbs.sphereAccess.create({
    sphereId: sphere.id,
    userId: member.id,
    role: "member",
    sphereAuthorizationToken: CloudUtil.createToken(),
    invitePending: false,
  });
  await dbs.sphereAccess.create({
    sphereId: sphere.id,
    userId: guest.id,
    role: "guest",
    sphereAuthorizationToken: CloudUtil.createToken(),
  });
  hub = await createHub(sphere.id, "myHub", 0);
  ({ stone, behaviour, ability, abilityProperty } = await createStone(
    sphere.id,
    "stone1",
    0
  ));
  ({
    stone: stone2,
    behaviour: behaviour2,
    ability: ability2,
    abilityProperty: abilityProperty2,
  } = await createStone(sphere.id, "stone2", 0));
  ({
    stone: stone3,
    behaviour: behaviour3,
    ability: ability3,
    abilityProperty: abilityProperty3,
  } = await createStone(sphere.id, "stone3", 0));
  location = await createLocation(sphere.id, "location", 0);

  stone.locationId = location.id;
  await dbs.stone.update(stone);

  // sets the token for the admin user for the auth function.
  token = await getToken(client, admin);
}

beforeEach(async () => {
  mocked(SSEManager.emit).mockReset();
  await clearTestDatabase();
  resetUsers();
  resetMockRandom();
  resetMockDatabaseIds();
});

beforeAll(async () => {
  app = await createApp();
  client = createRestAppClient(app);
});
afterAll(async () => {
  await app.stop();
});

test("Create and get messages", async () => {
  await populate();
  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {
      content: "member&guest:Message", everyoneInSphere: false, everyoneInSphereIncludingOwner: false},
      recipients: [member.id, guest.id],
  });
  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {
      content: "guest:Message", everyoneInSphere: false, everyoneInSphereIncludingOwner: false},
      recipients: [guest.id],
  });

  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {
      content: "everyoneMessageIncAdmin", everyoneInSphere: true, everyoneInSphereIncludingOwner: true},
  });

  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {
      content: "everyoneMessageExOwner", everyoneInSphere: true, everyoneInSphereIncludingOwner: false},
  });

  await client
    .get(auth(`/spheres/${sphere.id}/messages`))
    .expect(({ body }) => {
      expect(body).toMatchSnapshot('Admins messages');
    });

  let memberToken = await getToken(client, member);

  await client
    .get(auth(`/spheres/${sphere.id}/messages`, memberToken))
    .expect(({ body }) => {
      expect(body).toMatchSnapshot('messages for member');
    });

  let guestToken = await getToken(client, guest);

  await client
    .get(auth(`/spheres/${sphere.id}/messages`, guestToken))
    .expect(({ body }) => {
      expect(body).toMatchSnapshot('messages for guest');
    });
});

test("Create and get messages sent to self without duplicates", async () => {
  await populate();
  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {
      content: "adminDirect:Message", everyoneInSphere: false, everyoneInSphereIncludingOwner: false},
      recipients: [admin.id],
  });

  await client
    .get(auth(`/spheres/${sphere.id}/messages`))
    .expect(({ body }) => {
      expect(body).toHaveLength(1)
      expect(body).toMatchSnapshot('Admins direct messages');
    });
});


test("Create and get messages by the sender", async () => {
  await populate();
  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {content: "adminMessage", everyoneInSphere: true, everyoneInSphereIncludingOwner: true},
    recipients: [],
  });

  await client
    .get(auth(`/spheres/${sphere.id}/messages`))
    .expect(({ body }) => {
      expect(body.length).toBe(1);  // only the admin message is returned
    });
});


test("Check reading and app-deleting the message", async () => {
  await populate();
  let message;
  await client.post(auth(`/spheres/${sphere.id}/message`)).send({
    message: {
      content: "memberMessage", everyoneInSphere: false, everyoneInSphereIncludingOwner: false},
    recipients: [member.id],
  })
    .expect(({body}) => { message = body; });


  // member marks message gets it

  token = await getToken(client, member);
  await client.post(auth(`/messages/${message.id}/markAsRead`));

  expect(await Dbs.messageReadByUser.find()).toHaveLength(1);
  expect(await Dbs.messageDeletedByUser.find()).toHaveLength(0);

  await client.post(auth(`/messages/${message.id}/markAsDeleted`));

  expect(await Dbs.messageDeletedByUser.find()).toHaveLength(1);

  await client
    .get(auth(`/spheres/${sphere.id}/messages`))
    .expect(({ body }) => {
      expect(body).toMatchSnapshot();
    });

});
