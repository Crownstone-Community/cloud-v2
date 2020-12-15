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
import {StoneBehaviour} from "../../src/models/stoneSubModels/stone-behaviour.model";
import {StoneAbilityProperty} from "../../src/models/stoneSubModels/stone-ability-property.model";
import {StoneAbility} from "../../src/models/stoneSubModels/stone-ability.model";




export let USERS = {};
export function resetUsers() {
  USERS = {};
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
  lastCreatedUser.email = email;
  lastCreatedUser.password = hashedPassword;

  let dbs = getRepositories();
  let user = await dbs.user.create({email: email, password: hashedPassword, updatedAt: updatedAt })
  USERS[user.id] = {item: user, email: email, password: hashedPassword}
  return user;
}

export async function createSphere(userId, name?, updatedAt?) : Promise<Sphere> {
  updatedAt ??= Date.now();
  name      ??= generateName();

  let dbs = getRepositories();

  let sphere = await dbs.sphere.create({name, updatedAt});
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: userId, role:'admin', sphereAuthorizationToken: CloudUtil.createToken()});
  return sphere;
}

export async function createHub(sphereId, name?, updatedAt?, token?) : Promise<Hub> {
  updatedAt ??= Date.now();
  name      ??= generateName();
  token     ??= "helloI'mAHub";

  let dbs = getRepositories();

  let hub = await dbs.hub.create({sphereId: sphereId, name: name, token: token, updatedAt, httpPort:80, localIPAddress:'10.0.0.123'})
  await dbs.sphereAccess.create({sphereId: sphereId, userId: hub.id, role:'hub', sphereAuthorizationToken: CloudUtil.createToken()})
  return hub;
}

export async function createStone(sphereId, name?, updatedAt?) : Promise<{stone:Stone, behaviour:StoneBehaviour, ability:StoneAbility, abilityProperty: StoneAbilityProperty}> {
  updatedAt ??= Date.now();
  name      ??= generateName();
  let address = generateName()

  let dbs = getRepositories();

  let stone = await dbs.stone.create({sphereId: sphereId, name: name, address: address, updatedAt})
  let behaviour = await dbs.stoneBehaviour.create({ sphereId, stoneId: stone.id, type:'twilight', data:'helloMock', syncedToCrownstone: false, updatedAt});
  let ability = await dbs.stoneAbility.create({ sphereId, stoneId: stone.id, type:'dimming', enabled: false, syncedToCrownstone: false, updatedAt});
  let abilityProperty = await dbs.stoneAbilityProperty.create({ sphereId, stoneId: stone.id, abilityId: ability.id, type:'smoothDimming', value: 'true', updatedAt});

  return {stone, behaviour, ability, abilityProperty};
}


export async function createLocation(sphereId, name?, updatedAt?) : Promise<Location> {
  updatedAt ??= Date.now();
  name      ??= generateName();

  let dbs = getRepositories();

  let location = await dbs.location.create({sphereId: sphereId, name: name, updatedAt})

  return location;
}

