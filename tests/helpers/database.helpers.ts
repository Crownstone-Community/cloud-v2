import {testdb}                         from "../fixtures/datasources/testdb.datasource";

import {ToonRepository}                 from "../../src/repositories/data/toon.repository";
import {AppInstallationRepository}      from "../../src/repositories/data/app-installation.repository";
import {DevicePreferencesRepository}    from "../../src/repositories/data/device-preferences.repository";
import {DeviceRepository}               from "../../src/repositories/data/device.repository";
import {FingerprintLinkerRepository}    from "../../src/repositories/data/fingerprint-linker.repository";
import {FingerprintRepository}          from "../../src/repositories/data/fingerprint.repository";
import {LocationRepository}             from "../../src/repositories/data/location.repository";
import {MessageRepository}              from "../../src/repositories/data/message.repository";
import {MessageStateRepository}         from "../../src/repositories/data/message-state.repository";
import {MessageUserRepository}          from "../../src/repositories/data/message-user.repository";
import {SceneRepository}                from "../../src/repositories/data/scene.repository";
import {SphereAccessRepository}         from "../../src/repositories/data/sphere-access.repository";
import {SphereFeatureRepository}        from "../../src/repositories/data/sphere-feature.repository";
import {SphereTrackingNumberRepository} from "../../src/repositories/data/sphere-tracking-number.repository";
import {SphereRepository}               from "../../src/repositories/data/sphere.repository";
import {StoneRepository}                from "../../src/repositories/data/stone.repository";
import {StoneAbilityPropertyRepository} from "../../src/repositories/data/stone-ability-property.repository";
import {StoneAbilityRepository}         from "../../src/repositories/data/stone-ability.repository";
import {StoneBehaviourRepository}       from "../../src/repositories/data/stone-behaviour.repository";
import {StoneSwitchStateRepository}     from "../../src/repositories/data/stone-switch-state.repository";
import {UserRepository}                 from "../../src/repositories/users/user.repository";
import {HubRepository}                  from "../../src/repositories/users/hub.repository";
import {CrownstoneTokenRepository}      from "../../src/repositories/users/crownstone-token.repository";
import {StoneKeyRepository}             from "../../src/repositories/data/stone-key.repository";
import {SphereKeyRepository}            from "../../src/repositories/data/sphere-key.repository";
import {BootloaderRepository}           from "../../src/repositories/data/bootloader.repository";
import {FirmwareRepository}             from "../../src/repositories/data/firmware.repository";
import {OauthTokenRepository}           from "../../src/repositories/users/oauth-token.repository";

import {RepositoryContainer}            from "../../src/modules/containers/RepoContainer";
import {DeviceSphereMapRepository}      from "../../src/repositories/data/device-sphere-map.repository";
import {DeviceLocationMapRepository}    from "../../src/repositories/data/device-location-map.repository";

function initRepositories() : RepositoryContainer {
  let sphere:               SphereRepository;
  let bootloader:           BootloaderRepository;
  let oauthToken:           OauthTokenRepository;
  let appInstallation:      AppInstallationRepository;
  let deviceLocationMap:    DeviceLocationMapRepository;
  let deviceSphereMap:      DeviceSphereMapRepository;
  let devicePreferences:    DevicePreferencesRepository
  let device:               DeviceRepository;
  let fingerprintLinker:    FingerprintLinkerRepository;
  let fingerprint:          FingerprintRepository;
  let firmware:             FirmwareRepository;
  let location:             LocationRepository;
  let message:              MessageRepository;
  let messageState:         MessageStateRepository;
  let messageUser:          MessageUserRepository;
  let scene:                SceneRepository;
  let sphereAccess:         SphereAccessRepository;
  let sphereFeature:        SphereFeatureRepository;
  let sphereTrackingNumber: SphereTrackingNumberRepository;
  let sphereKeys:           SphereKeyRepository;
  let stone:                StoneRepository;
  let stoneAbilityProperty: StoneAbilityPropertyRepository;
  let stoneAbility:         StoneAbilityRepository;
  let stoneBehaviour:       StoneBehaviourRepository;
  let stoneSwitchState:     StoneSwitchStateRepository;
  let stoneKeys:            StoneKeyRepository;;
  let toon:                 ToonRepository;
  let user:                 UserRepository;
  let hub:                  HubRepository;
  let crownstoneToken:      CrownstoneTokenRepository;


  let sphereGetter       = () : Promise<SphereRepository>       => { return new Promise((resolve, _) => { resolve(sphere) })}
  let deviceGetter       = () : Promise<DeviceRepository>       => { return new Promise((resolve, _) => { resolve(device) })}
  let locationGetter     = () : Promise<LocationRepository>     => { return new Promise((resolve, _) => { resolve(location) })}
  let stoneGetter        = () : Promise<StoneRepository>        => { return new Promise((resolve, _) => { resolve(stone) })}
  let abilityGetter      = () : Promise<StoneAbilityRepository> => { return new Promise((resolve, _) => { resolve(stoneAbility) })}
  let sphereAccessGetter = () : Promise<SphereAccessRepository> => { return new Promise((resolve, _) => { resolve(sphereAccess) })}
  let messageGetter      = () : Promise<MessageRepository>      => { return new Promise((resolve, _) => { resolve(message) })}
  let stoneSwitchGetter  = () : Promise<StoneSwitchStateRepository>  => { return new Promise((resolve, _) => { resolve(stoneSwitchState) })}
  let fingerprintGetter  = () : Promise<FingerprintRepository> => { return new Promise((resolve, _) => { resolve(fingerprint) })}
  let messageUserGetter  = () : Promise<MessageUserRepository> => { return new Promise((resolve, _) => { resolve(messageUser) })}
  let userGetter         = () : Promise<UserRepository>        => { return new Promise((resolve, _) => { resolve(user) })}


  hub                  = new HubRepository(testdb, sphereGetter, stoneGetter, locationGetter);
  crownstoneToken      = new CrownstoneTokenRepository(testdb);
  bootloader           = new BootloaderRepository(testdb);
  firmware             = new FirmwareRepository(testdb);
  oauthToken           = new OauthTokenRepository(testdb);

  appInstallation      = new AppInstallationRepository(testdb, deviceGetter);
  devicePreferences    = new DevicePreferencesRepository(testdb, deviceGetter);
  fingerprintLinker    = new FingerprintLinkerRepository(testdb, sphereGetter, locationGetter, deviceGetter, fingerprintGetter);
  deviceSphereMap      = new DeviceSphereMapRepository(testdb, userGetter, deviceGetter, sphereGetter);
  deviceLocationMap    = new DeviceLocationMapRepository(testdb, userGetter, deviceGetter, sphereGetter, locationGetter);
  device               = new DeviceRepository(testdb, userGetter, appInstallation, fingerprintLinker, devicePreferences);
  fingerprint          = new FingerprintRepository(testdb, sphereGetter);
  location             = new LocationRepository(testdb, sphereGetter);
  messageState         = new MessageStateRepository(testdb, sphereGetter, messageGetter, messageGetter, userGetter);
  messageUser          = new MessageUserRepository(testdb, sphereGetter, messageGetter, userGetter);
  message              = new MessageRepository(testdb, sphereGetter, userGetter, messageUserGetter, messageState);
  scene                = new SceneRepository(testdb, sphereGetter);
  sphereAccess         = new SphereAccessRepository(testdb, sphereGetter);
  sphereFeature        = new SphereFeatureRepository(testdb, sphereGetter);
  sphereTrackingNumber = new SphereTrackingNumberRepository(testdb, sphereGetter);
  sphereKeys           = new SphereKeyRepository(testdb, sphereGetter);
  stoneAbilityProperty = new StoneAbilityPropertyRepository(testdb, sphereGetter, stoneGetter, abilityGetter );
  stoneAbility         = new StoneAbilityRepository(testdb,  sphereGetter, stoneGetter, stoneAbilityProperty);
  stoneBehaviour       = new StoneBehaviourRepository(testdb, sphereGetter, stoneGetter);
  stoneSwitchState     = new StoneSwitchStateRepository(testdb, sphereGetter, stoneGetter);
  stoneKeys            = new StoneKeyRepository(testdb, sphereGetter, stoneGetter);
  stone                = new StoneRepository(testdb, sphereGetter, locationGetter, stoneSwitchGetter, stoneBehaviour, stoneAbility, stoneSwitchState);
  toon                 = new ToonRepository(testdb, sphereGetter);

  sphere               = new SphereRepository(testdb, sphereAccessGetter, userGetter, stone, location, scene, message, hub, sphereFeature, sphereTrackingNumber, toon);
  user                 = new UserRepository(testdb, sphereAccessGetter, sphereGetter, device);


  return {
    sphere,
    bootloader,
    oauthToken,
    appInstallation,
    devicePreferences,
    deviceLocationMap,
    deviceSphereMap,
    device,
    fingerprintLinker,
    fingerprint,
    firmware,
    location,
    message,
    messageState,
    messageUser,
    scene,
    sphereAccess,
    sphereFeature,
    sphereTrackingNumber,
    sphereKeys,
    stoneKeys,
    stone,
    stoneAbilityProperty,
    stoneAbility,
    stoneBehaviour,
    stoneSwitchState,
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
  let dbObject = initRepositories();
  let dbs = Object.keys(dbObject);
  for (let i = 0; i < dbs.length; i++) {
    // @ts-ignore
    await dbObject[dbs[i]].deleteAll();
  }
}

export function getRepositories() {
  return initRepositories();
}