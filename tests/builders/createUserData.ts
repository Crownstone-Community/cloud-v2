'use strict'
// mock the endpoind REST uses

import {getRepositories}       from "../helpers";
import {Hub}                   from "../../src/models/hub.model";
import {Sphere}                from "../../src/models/sphere.model";
import {User}                  from "../../src/models/user.model";
import {Stone}                 from "../../src/models/stone.model";
import {Location}              from "../../src/models/location.model";
import {generateName}          from "../mocks/CloudUtil.mock";
import {CloudUtil}             from "../../src/util/CloudUtil";
import {StoneBehaviour}        from "../../src/models/stoneSubModels/stone-behaviour.model";
import {StoneAbilityProperty}  from "../../src/models/stoneSubModels/stone-ability-property.model";
import {StoneAbility}          from "../../src/models/stoneSubModels/stone-ability.model";
import {getHubToken, getToken} from "../rest-helpers/rest.helpers";
import {Client}                from "@loopback/testlab";
import {keyTypes}              from "../../src/enums";
import {StoneKey}              from "../../src/models/stoneSubModels/stone-key.model";
import {StoneSwitchState}      from "../../src/models/stoneSubModels/stone-switch-state.model";
import {MessageV2} from "../../src/models/messageV2.model";




export let USERS = {};
export let HUBS = {};
export function resetUsers() {
  USERS = {};
  HUBS = {};
}

export let lastCreatedUser = {
  email: null,
  password: null,
}

export async function createUser(email?, password?, updatedAt?, profilePictureId?) : Promise<User> {
  updatedAt ??= Date.now();
  email     ??= generateName() + "@test.com";
  password  ??= 'test';
  let hashedPassword = CloudUtil.hashPassword(password);
  lastCreatedUser.email = email;
  lastCreatedUser.password = hashedPassword;

  let dbs = getRepositories();
  let user = await dbs.user.create({email: email, password: hashedPassword, updatedAt: updatedAt, profilePicId: profilePictureId })
  USERS[user.id] = {item: user, email: email, password: hashedPassword}
  return user;
}

export async function createMessage(userId, sphereId, content = 'helloWorld', recipients = []) : Promise<MessageV2> {
  let dbs = getRepositories()
  if (recipients.length == 0) {
    let message = await dbs.messageV2.create({
      content: content,
      ownerId: userId,
      sphereId,
      everyoneInSphere: true,
      everyoneInSphereIncludingOwner: true
    })
    return message;
  }

  let message = await dbs.messageV2.create({
    content: content,
    ownerId: userId,
    sphereId,
    everyoneInSphere: false,
    everyoneInSphereIncludingOwner: false
  })
  for (let recipient of recipients) {
    await dbs.messageRecipientUser.create({sphereId, messageId: message.id, userId: recipient})
  }

  return message;
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
  HUBS[hub.id] = hub;
  return hub;
}

export async function createStone(sphereId, name?, updatedAt?) : Promise<{stone:Stone, behaviour:StoneBehaviour, ability:StoneAbility, abilityProperty: StoneAbilityProperty, keys: StoneKey[], switchState: StoneSwitchState[]}> {
  updatedAt ??= Date.now();
  name      ??= generateName();
  let address = generateName()

  let dbs = getRepositories();

  let stone = await dbs.stone.create({sphereId: sphereId, name: name, address: address, updatedAt})
  let behaviour = await dbs.stoneBehaviour.create({ sphereId, stoneId: stone.id, type:'twilight', data:'helloMock', syncedToCrownstone: false, updatedAt});
  let ability = await dbs.stoneAbility.create({ sphereId, stoneId: stone.id, type:'dimming', enabled: false, syncedToCrownstone: false, updatedAt});
  let abilityProperty = await dbs.stoneAbilityProperty.create({ sphereId, stoneId: stone.id, abilityId: ability.id, type:'smoothDimming', value: 'true', updatedAt});
  let keys = await dbs.stoneKeys.createAll([
    {sphereId: sphereId, stoneId: stone.id, keyType: keyTypes.MESH_DEVICE_KEY, key: CloudUtil.createKey(), ttl:0},
    {sphereId: sphereId, stoneId: stone.id, keyType: keyTypes.DEVICE_UART_KEY, key: CloudUtil.createKey(), ttl:0},
  ]);
  let switchState = await dbs.stoneSwitchState.createAll([
    {sphereId: sphereId, stoneId: stone.id, timestamp: new Date(), switchState: 1},
    {sphereId: sphereId, stoneId: stone.id, timestamp: new Date(), switchState: 1},
  ]);
  return {stone, behaviour, ability, abilityProperty, keys, switchState};
}


export async function createLocation(sphereId, name?, updatedAt?, imageId?) : Promise<Location> {
  updatedAt ??= Date.now();
  name      ??= generateName();

  let dbs = getRepositories();

  let location = await dbs.location.create({sphereId: sphereId, name: name, updatedAt, imageId})

  return location;
}

/**
 * Creates a database entry for 1 sphere, 2 users and everything that can be touched by the sanitizer
 * it also has an additional, orphaned, image and 3 unused fingerprints.
 *
 * Initially designed for sanitation testing
 * @param client
 * @param version
 */
export async function createMockSphereDatabase(client: Client, version: string) {
  // create a database with a lot of things
  let dbs = getRepositories();

  // create a few fake images
  let image1 = await dbs.fsFiles.create({length: 100, chunkSize: 251200, filename:"image.jpg", contentType:'binary/octet-stream'})
  let image1_chunk0 = await dbs.fsChunks.create({files_id:image1.id, n: 0, data: Buffer.from("abcde")})
  let image1_chunk1 = await dbs.fsChunks.create({files_id:image1.id, n: 1, data: Buffer.from("fghij")})
  let image2 = await dbs.fsFiles.create({length: 100, chunkSize: 251200, filename:"image.jpg", contentType:'binary/octet-stream'})
  let image2_chunk0 = await dbs.fsChunks.create({files_id:image2.id, n: 0, data: Buffer.from("abcde")})
  let image3 = await dbs.fsFiles.create({length: 100, chunkSize: 251200, filename:"image.jpg", contentType:'binary/octet-stream'})
  let image3_chunk0 = await dbs.fsChunks.create({files_id:image3.id, n: 0, data: Buffer.from("abcde")})
  let image4 = await dbs.fsFiles.create({length: 100, chunkSize: 251200, filename:"image.jpg", contentType:'binary/octet-stream'})
  let image4_chunk0 = await dbs.fsChunks.create({files_id:image4.id, n: 0, data: Buffer.from("abcde")})
  let image5 = await dbs.fsFiles.create({length: 100, chunkSize: 251200, filename:"image.jpg", contentType:'binary/octet-stream'})
  let image5_chunk0 = await dbs.fsChunks.create({files_id:image5.id, n: 0, data: Buffer.from("abcde")})
  let image5_chunk1 = await dbs.fsChunks.create({files_id:image5.id, n: 1, data: Buffer.from("fghij")})

  // create users
  let admin    = await createUser(`${version}_admin@test.com`,  'test', 0, image5.id);
  let member   = await createUser(`${version}_member@test.com`, 'test', 0);

  // create sphere
  let sphere   = await createSphere(admin.id, 'mySphere', 0);
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: member.id, role:'member', sphereAuthorizationToken: CloudUtil.createToken()});

  // create hub
  let hub      = await createHub(sphere.id, 'myHub', 0);

  // create stones
  let {stone: stone1, behaviour: behaviour1, ability: ability1, abilityProperty: abilityProperty1} = await createStone(sphere.id, 'stone1', 0);
  let {stone: stone2, behaviour: behaviour2, ability: ability2, abilityProperty: abilityProperty2} = await createStone(sphere.id, 'stone2', 0);
  let {stone: stone3, behaviour: behaviour3, ability: ability3, abilityProperty: abilityProperty3} = await createStone(sphere.id, 'stone3', 0);

  // create locations
  let location1 = await createLocation(sphere.id,  `${version}_location`, 0, image1.id);
  let location2 = await createLocation(sphere.id, `${version}_location2`, 0, image2.id);
  let location3 = await createLocation(sphere.id, `${version}_location3`, 0);

  // put stone in location
  stone1.locationId = location1.id;
  await dbs.stone.update(stone1);

  // create scenes
  let scenes1 = await dbs.scene.create({sphereId: sphere.id, data:'test', stockPicture:'Dinner-2',    name:`${version}_myScene1`})
  let scenes2 = await dbs.scene.create({sphereId: sphere.id, data:'test', stockPicture:'barPic',      name:`${version}_myScene2`})
  let scenes3 = await dbs.scene.create({sphereId: sphere.id, data:'test', customPictureId: image3.id, name:`${version}_myScene3`})

  // insert accessTokens
  await getHubToken(client, hub)
  await getToken(client, admin);
  await getToken(client, member);

  let device1 = await dbs.device.create({name:`${version}_device`,        address:'abc', ownerId: admin.id});
  let device2 = await dbs.device.create({name:`${version}_device_backup`, address:'abc', ownerId: admin.id});
  let member_device3 = await dbs.device.create({name:`${version}_device`,        address:'abc', ownerId: member.id});

  let deviceInstallation1 = await dbs.appInstallation.create({appName:'testApp', deviceType:'phone', developmentApp: false, deviceId: device1.id});
  let deviceInstallation2 = await dbs.appInstallation.create({appName:'testApp', deviceType:'phone', developmentApp: false, deviceId: device2.id});
  let deviceInstallation3 = await dbs.appInstallation.create({appName:'testApp', deviceType:'phone', developmentApp: false, deviceId: member_device3.id});

  let devicePreferences1 = await dbs.devicePreferences.create({property:'prop',  value:'true',  deviceId: device1.id});
  let devicePreferences2 = await dbs.devicePreferences.create({property:'prop2', value:'false', deviceId: device1.id});
  let devicePreferences3 = await dbs.devicePreferences.create({property:'prop',  value:'true',  deviceId: device2.id});
  let devicePreferences4 = await dbs.devicePreferences.create({property:'prop',  value:'true',  deviceId: member_device3.id});

  let fingerprint1  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location1.id, ownerId: admin.id,  data: "data"});
  let fingerprint2  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location2.id, ownerId: admin.id,  data: "data"});
  let fingerprint3  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location3.id, ownerId: member.id, data: "data"});
  let fingerprint4  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location1.id, ownerId: admin.id,  data: "data"});
  let fingerprint5  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location2.id, ownerId: member.id, data: "data"});
  let fingerprint6  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location3.id, ownerId: admin.id,  data: "data"});
  let fingerprint7  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location1.id, ownerId: member.id, data: "data"});
  let fingerprint8  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location2.id, ownerId: admin.id,  data: "data"});
  let fingerprint9  = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location3.id, ownerId: member.id, data: "data"});
  let fingerprint10 = await dbs.fingerprint.create({sphereId: sphere.id, locationId: location1.id, ownerId: member.id, data: "data"});

  let fingerprintLink_device1_1 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: device1.id, locationId: location1.id, fingerprintId: fingerprint1.id });
  let fingerprintLink_device1_2 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: device1.id, locationId: location2.id, fingerprintId: fingerprint2.id });
  let fingerprintLink_device1_3 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: device1.id, locationId: location3.id, fingerprintId: fingerprint6.id });
  let fingerprintLink_device2_1 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: device2.id, locationId: location1.id, fingerprintId: fingerprint4.id });
  let fingerprintLink_device2_2 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: device2.id, locationId: location2.id, fingerprintId: fingerprint5.id });
  let fingerprintLink_device2_3 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: device2.id, locationId: location3.id, fingerprintId: fingerprint6.id });
  let fingerprintLink_device3_1 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: member_device3.id, locationId: location1.id, fingerprintId: fingerprint7.id });
  let fingerprintLink_device3_2 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: member_device3.id, locationId: location2.id, fingerprintId: fingerprint5.id });
  let fingerprintLink_device3_3 = await dbs.fingerprintLinker.create({sphereId: sphere.id, deviceId: member_device3.id, locationId: location3.id, fingerprintId: fingerprint9.id });

  let toon = await dbs.toon.create({
    sphereId: sphere.id,
    toonAgreementId: 'toonAgreementId',
    toonAddress: 'toonAddress',
    refreshToken: 'refreshToken',
    refreshTokenTTL: 12345,
    refreshTokenUpdatedAt: new Date().valueOf(),
    refreshTokenUpdatedFrom: new Date().valueOf()
  });

  let sphereTrackingNumber1 = await dbs.sphereTrackingNumber.create({sphereId:sphere.id})
  let sphereTrackingNumber2 = await dbs.sphereTrackingNumber.create({sphereId:sphere.id})
  let sphereTrackingNumber3 = await dbs.sphereTrackingNumber.create({sphereId:sphere.id})

  return {
    users: {admin, member},
    sphere: sphere,
  }
}

