import {testdb} from "../fixtures/datasources/testdb.datasource";
import {ToonRepository} from "../../src/repositories/data/toon.repository";
import {AppInstallationRepository} from "../../src/repositories/data/app-installation.repository";
import {DevicePreferencesRepository} from "../../src/repositories/data/device-preferences.repository";
import {DeviceRepository} from "../../src/repositories/data/device.repository";
import {FingerprintLinkerRepository} from "../../src/repositories/data/fingerprint-linker.repository";
import {FingerprintRepository} from "../../src/repositories/data/fingerprint.repository";
import {LocationRepository} from "../../src/repositories/data/location.repository";
import {MessageRepository} from "../../src/repositories/data/message.repository";
import {MessageStateRepository} from "../../src/repositories/data/message-state.repository";
import {MessageUserRepository} from "../../src/repositories/data/message-user.repository";
import {SceneRepository} from "../../src/repositories/data/scene.repository";
import {SortedListRepository} from "../../src/repositories/data/sorted-list.repository";
import {SphereAccessRepository} from "../../src/repositories/data/sphere-access.repository";
import {SphereFeatureRepository} from "../../src/repositories/data/sphere-feature.repository";
import {SphereTrackingNumberRepository} from "../../src/repositories/data/sphere-tracking-number.repository";
import {SphereRepository} from "../../src/repositories/data/sphere.repository";
import {StoneRepository} from "../../src/repositories/data/stone.repository";
import {StoneAbilityPropertyRepository} from "../../src/repositories/data/stone-ability-property.repository";
import {StoneAbilityRepository} from "../../src/repositories/data/stone-ability.repository";
import {StoneBehaviourRepository} from "../../src/repositories/data/stone-behaviour.repository";
import {StoneSwitchStateRepository} from "../../src/repositories/data/stone-switch-state.repository";
import {PositionRepository} from "../../src/repositories/data/position.repository";
import {UserRepository} from "../../src/repositories/users/user.repository";
import {HubRepository} from "../../src/repositories/users/hub.repository";
import {CrownstoneTokenRepository} from "../../src/repositories/users/crownstone-token.repository";



function init() {
  let sphere : SphereRepository;
  let appInstallation : AppInstallationRepository;
  let devicePreferences : DevicePreferencesRepository
  let device : DeviceRepository;
  let fingerprintLinker: FingerprintLinkerRepository
  let fingerprint: FingerprintRepository
  let location: LocationRepository
  let message: MessageRepository
  let messageState: MessageStateRepository
  let messageUser: MessageUserRepository
  let scene: SceneRepository
  let sortedList: SortedListRepository
  let sphereAccess:SphereAccessRepository
  let sphereFeature:SphereFeatureRepository
  let sphereTrackingNumber: SphereTrackingNumberRepository
  let stone: StoneRepository
  let stoneAbilityProperty: StoneAbilityPropertyRepository
  let stoneAbility: StoneAbilityRepository
  let stoneBehaviour: StoneBehaviourRepository
  let stoneSwitchState: StoneSwitchStateRepository
  let position: PositionRepository
  let toon: ToonRepository;
  let user: UserRepository
  let hub: HubRepository
  let crownstoneToken: CrownstoneTokenRepository


  let sphereGetter       = () : Promise<SphereRepository>     => { return new Promise((resolve, _) => { resolve(sphere) })}
  let deviceGetter       = () : Promise<DeviceRepository>     => { return new Promise((resolve, _) => { resolve(device) })}
  let locationGetter     = () : Promise<LocationRepository>   => { return new Promise((resolve, _) => { resolve(location) })}
  let stoneGetter        = () : Promise<StoneRepository>      => { return new Promise((resolve, _) => { resolve(stone) })}
  let abilityGetter      = () : Promise<StoneAbilityRepository>  => { return new Promise((resolve, _) => { resolve(stoneAbility) })}
  let sphereAccessGetter = () : Promise<SphereAccessRepository>  => { return new Promise((resolve, _) => { resolve(sphereAccess) })}
  let messageGetter      = () : Promise<MessageRepository>    => { return new Promise((resolve, _) => { resolve(message) })}
  let positionGetter     = () : Promise<PositionRepository>  => { return new Promise((resolve, _) => { resolve(position) })}
  let stoneSwitchGetter  = () : Promise<StoneSwitchStateRepository>  => { return new Promise((resolve, _) => { resolve(stoneSwitchState) })}
  let fingerprintGetter  = () : Promise<FingerprintRepository> => { return new Promise((resolve, _) => { resolve(fingerprint) })}
  let messageUserGetter  = () : Promise<MessageUserRepository> => { return new Promise((resolve, _) => { resolve(messageUser) })}
  let userGetter         = () : Promise<UserRepository>        => { return new Promise((resolve, _) => { resolve(user) })}


  hub                  = new HubRepository(testdb, sphereGetter)
  crownstoneToken      = new CrownstoneTokenRepository(testdb)

  appInstallation      = new AppInstallationRepository(testdb, deviceGetter);
  devicePreferences    = new DevicePreferencesRepository(testdb, deviceGetter);
  fingerprintLinker    = new FingerprintLinkerRepository(testdb, sphereGetter, locationGetter, deviceGetter, fingerprintGetter);
  device               = new DeviceRepository(testdb, userGetter, appInstallation, fingerprintLinker, devicePreferences);
  fingerprint          = new FingerprintRepository(testdb, sphereGetter);
  location             = new LocationRepository(testdb, sphereGetter, positionGetter);
  messageState         = new MessageStateRepository(testdb, sphereGetter, messageGetter, messageGetter, userGetter);
  messageUser          = new MessageUserRepository(testdb, sphereGetter, messageGetter, userGetter);
  message              = new MessageRepository(testdb, sphereGetter, userGetter, messageUserGetter, messageState);
  scene                = new SceneRepository(testdb, sphereGetter);
  sortedList           = new SortedListRepository(testdb, sphereGetter);
  sphereAccess         = new SphereAccessRepository(testdb, sphereGetter);
  sphereFeature        = new SphereFeatureRepository(testdb, sphereGetter);
  sphereTrackingNumber = new SphereTrackingNumberRepository(testdb, sphereGetter);
  stoneAbilityProperty = new StoneAbilityPropertyRepository(testdb, sphereGetter, stoneGetter, abilityGetter );
  stoneAbility         = new StoneAbilityRepository(testdb,  sphereGetter, stoneGetter, stoneAbilityProperty);
  stoneBehaviour       = new StoneBehaviourRepository(testdb, sphereGetter, stoneGetter);
  stoneSwitchState     = new StoneSwitchStateRepository(testdb, sphereGetter, stoneGetter);
  stone                = new StoneRepository(testdb, sphereGetter, locationGetter, stoneSwitchGetter, stoneBehaviour, stoneAbility, stoneSwitchState);
  position             = new PositionRepository(testdb, sphereGetter);
  toon                 = new ToonRepository(testdb, sphereGetter);

  sphere               = new SphereRepository(testdb, userGetter, sphereAccessGetter, userGetter, stone, location, scene, message, hub, sortedList, sphereFeature, sphereTrackingNumber, toon);
  user                 = new UserRepository(testdb, sphere, device);


  return {
    sphere,
    appInstallation,
    devicePreferences,
    device,
    fingerprintLinker,
    fingerprint,
    location,
    message,
    messageState,
    messageUser,
    scene,
    sortedList,
    sphereAccess,
    sphereFeature,
    sphereTrackingNumber,
    stone,
    stoneAbilityProperty,
    stoneAbility,
    stoneBehaviour,
    stoneSwitchState,
    position,
    toon,
    user,
    hub,
    crownstoneToken,
  }
}




/**
 * This clears the testDb for all users
 */
export async function clearTestDatabase() {
  let dbObject = init();

  let dbs = Object.keys(dbObject);
  for (let i = 0; i < dbs.length; i++) {
    await dbs[dbs[i]].deleteAll();
  }
}

export function getRepositories() {
  return init();
}