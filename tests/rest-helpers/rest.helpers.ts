import {lastCreatedUser} from "../builders/createUserData";
import {supertest} from "@loopback/testlab";

export function login(client : supertest.SuperTest<supertest.Test>) {
  return client.post("/user/login").send(lastCreatedUser);
}

let lastSeenToken = null;
export async function getToken(client : supertest.SuperTest<supertest.Test>) {
  let tokenData = null;
  await client.post("/user/login").send(lastCreatedUser).expect(200).expect(({body}) => { tokenData = body; })
  lastSeenToken = tokenData.id;
  return tokenData.id;
}

export function auth(url, token?) {
  token ??= lastSeenToken;
  return url + "?access_token=" + token
}