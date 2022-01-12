import {lastCreatedUser, USERS} from "../builders/createUserData";
import {supertest} from "@loopback/testlab";

export function login(client : supertest.SuperTest<supertest.Test>, user?) {
  return client.post("/user/login").send(lastCreatedUser);
}

let lastSeenToken = null;
export async function getToken(client : supertest.SuperTest<supertest.Test>, user?) {
  let userLoginData = {
    email: lastCreatedUser.email,
    password: lastCreatedUser.password
  }
  if (user) {
    if (USERS[user.id] === undefined) {
      throw "User is not defined. Did you want to get a hub token? Use getHubToken for this."
    }
    userLoginData.email    = USERS[user.id].email;
    userLoginData.password = USERS[user.id].password;
  }

  let tokenData = null;
  await client.post("/user/login").send(userLoginData).expect(200).expect(({body}) => { tokenData = body; })
  lastSeenToken = tokenData.id;
  return tokenData.id;
}

export async function getHubToken(client : supertest.SuperTest<supertest.Test>, hub) {
  let tokenData = null;
  await client.post(`/hub/${hub.id}/login?token=${hub.token}`).expect(200).expect(({body}) => { tokenData = body; })
  lastSeenToken = tokenData.id;
  return tokenData.id;
}

export async function setAuthToUser(client : supertest.SuperTest<supertest.Test>, user) {
  return await getToken(client, user);
}

export function auth(url, token?) {
  token ??= lastSeenToken;
  return url + "?access_token=" + token
}