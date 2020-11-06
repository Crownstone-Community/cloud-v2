'use strict'
// mock the endpoind REST uses

import {getRepositories} from "../helpers";
import {CloudUtil} from "../../src/util/CloudUtil";
import {Hub} from "../../src/models/hub.model";
import {Sphere} from "../../src/models/sphere.model";
import {User} from "../../src/models/user.model";

function generateName() {
  return Math.floor(Math.random()*1e12).toString(36)
}

export let lastCreatedUser = {
  email: null,
  password: null,
}

export async function createUser(email?, password?, updatedAt?) : Promise<User> {
  updatedAt ??= Date.now();
  email     ??= generateName() + "@test.com";
  password  ??= 'test';

  let hashedPassword = CloudUtil.hashPassword(password);

  let dbs = getRepositories();
  lastCreatedUser.email = email;
  lastCreatedUser.password = hashedPassword;
  let user = await dbs.user.create({email: email, password: hashedPassword, updatedAt: updatedAt })
  return user;
}

export async function createSphere(userId, name?, updatedAt?, children= false) : Promise<Sphere> {
  updatedAt ??= Date.now();
  name      ??= generateName();

  let dbs = getRepositories();

  let sphere = await dbs.sphere.create({name, updatedAt})
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: userId, role:'admin', sphereAuthorizationToken: CloudUtil.createToken()});
  if (children) {

  }
  return sphere;
}

export async function createHub(sphereId, name?, updatedAt?, token?) : Promise<Hub> {
  updatedAt ??= Date.now();
  name      ??= generateName();
  token     ??= "helloI'mAHub";

  let dbs = getRepositories();

  let hub = await dbs.hub.create({sphereId: sphereId, name: name, token: token, updatedAt})
  await dbs.sphereAccess.create({sphereId: sphereId, userId: hub.id, role:'admin', sphereAuthorizationToken: CloudUtil.createToken()})
  return hub;
}

