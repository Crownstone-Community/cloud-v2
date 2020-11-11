'use strict'
// mock the endpoind REST uses

import {getRepositories} from "../helpers";
import {Hub} from "../../src/models/hub.model";
import {Sphere} from "../../src/models/sphere.model";
import {User} from "../../src/models/user.model";
import {Stone} from "../../src/models/stone.model";
import {Location} from "../../src/models/location.model";
import {generateName} from "../mocks/CloudUtil.mock";
import {CloudUtil} from "../../src/util/CloudUtil";



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
  await dbs.sphereAccess.create({sphereId: sphereId, userId: hub.id, role:'hub', sphereAuthorizationToken: CloudUtil.createToken()})
  return hub;
}

export async function createStone(sphereId, name?, updatedAt?) : Promise<Stone> {
  updatedAt ??= Date.now();
  name      ??= generateName();
  let address = generateName()

  let dbs = getRepositories();

  let stone = await dbs.stone.create({sphereId: sphereId, name: name, address: address, updatedAt})
  await dbs.stoneBehaviour.create({ sphereId, stoneId: stone.id, type:'twilight', data:'helloMock', syncedToCrownstone: false, updatedAt});
  let ability = await dbs.stoneAbility.create({ sphereId, stoneId: stone.id, type:'dimming', enabled: false, syncedToCrownstone: false, updatedAt});
  await dbs.stoneAbilityProperty.create({ sphereId, stoneId: stone.id, abilityId: ability.id, type:'smoothDimming', value: 'true', updatedAt});

  return stone;
}


export async function createLocation(sphereId, name?, updatedAt?) : Promise<Location> {
  updatedAt ??= Date.now();
  name      ??= generateName();

  let dbs = getRepositories();

  let location = await dbs.location.create({sphereId: sphereId, name: name, updatedAt})

  return location;
}

