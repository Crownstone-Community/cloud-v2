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
import {FsChunksRepository}             from "../../src/repositories/files/fs.chunks.repository";
import {FsFilesRepository}              from "../../src/repositories/files/fs.files.repository";

import { User }                 from "../../src/models/user.model";
import { Toon }                 from "../../src/models/toon.model";
import { AppInstallation }      from "../../src/models/app-installation.model";
import { Bootloader }           from "../../src/models/bootloader.model";
import { CrownstoneToken }      from "../../src/models/crownstone-token.model";
import { Device }               from "../../src/models/device.model";
import { DeviceLocationMap }    from "../../src/models/device-location-map.model";
import { DevicePreferences }    from "../../src/models/device-preferences.model";
import { DeviceSphereMap }      from "../../src/models/device-sphere-map.model";
import { Fingerprint }          from "../../src/models/fingerprint.model";
import { FingerprintLinker }    from "../../src/models/fingerprint-linker.model";
import { Firmware }             from "../../src/models/firmware.model";
import { FsChunks }             from "../../src/models/gridFS/fs.chunks.model";
import { FsFiles }              from "../../src/models/gridFS/fs.files.model";
import { Hub }                  from "../../src/models/hub.model";
import { Message }              from "../../src/models/message.model";
import { Location }             from "../../src/models/location.model";
import { MessageState }         from "../../src/models/messageSubModels/message-state.model";
import { MessageUser }          from "../../src/models/messageSubModels/message-user.model";
import { OauthToken }           from "../../src/models/oauth-token.model";
import { Scene }                from "../../src/models/scene.model";
import { Sphere }               from "../../src/models/sphere.model";
import { SphereAccess }         from "../../src/models/sphere-access.model";
import { SphereFeature }        from "../../src/models/sphere-feature.model";
import { SphereKeys }           from "../../src/models/sphere-key.model";
import { SphereTrackingNumber } from "../../src/models/sphere-tracking-number.model";
import { Stone }                from "../../src/models/stone.model";
import { StoneAbility }         from "../../src/models/stoneSubModels/stone-ability.model";
import { StoneAbilityProperty } from "../../src/models/stoneSubModels/stone-ability-property.model";
import { StoneBehaviour }       from "../../src/models/stoneSubModels/stone-behaviour.model";
import { StoneKey }             from "../../src/models/stoneSubModels/stone-key.model";
import { StoneSwitchState }     from "../../src/models/stoneSubModels/stone-switch-state.model";
import {FingerprintV2Repository} from "../../src/repositories/data/fingerprint-v2.repository";
import {MessageV2Repository} from "../../src/repositories/data/messageV2.repository";
import {MessageRecipientUserRepository} from "../../src/repositories/data/message-recipient-user.repository";
import {MessageDeletedByUserRepository} from "../../src/repositories/data/message-deletedBy-user.repository";
import {MessageReadByUserRepository} from "../../src/repositories/data/message-readBy-user.repository";
import {MessageV2} from "../../src/models/messageV2.model";
import {MessageDeletedByUser} from "../../src/models/messageSubModels/message-deletedBy-user.model";
import {MessageReadByUser} from "../../src/models/messageSubModels/message-readBy-user.model";
import {MessageRecipientUser} from "../../src/models/messageSubModels/message-recipient-user.model";
import {AppRepository} from "../../src/repositories/data/app.repository";
import {EnergyData} from "../../src/models/stoneSubModels/stone-energy-data.model";
import {EnergyDataProcessed} from "../../src/models/stoneSubModels/stone-energy-data-processed.model";
import {EnergyDataRepository} from "../../src/repositories/data/stone-energy-data.repository";
import {EnergyDataProcessedRepository} from "../../src/repositories/data/stone-energy-data-processed.repository";

interface DatabaseDump {
  appInstallation          : AppInstallation[],
  bootloader               : Bootloader[],
  crownstoneToken          : CrownstoneToken[],
  device                   : Device[],
  deviceLocationMap        : DeviceLocationMap[],
  devicePreferences        : DevicePreferences[],
  deviceSphereMap          : DeviceSphereMap[],
  fingerprint              : Fingerprint[],
  fingerprintLinker        : FingerprintLinker[],
  firmware                 : Firmware[],
  fsChunks                 : FsChunks[],
  fsFiles                  : FsFiles[],
  hub                      : Hub[],
  location                 : Location[],
  messageV2                : MessageV2[],
  message                  : Message[],
  messageState             : MessageState[],
  messageUser              : MessageUser[],
  messageRecipientUser     : MessageRecipientUser[],
  messageReadByUser        : MessageReadByUser[],
  messageDeletedByUser     : MessageDeletedByUser[],
  oauthToken               : OauthToken[],
  scene                    : Scene[],
  sphere                   : Sphere[],
  sphereAccess             : SphereAccess[],
  sphereFeature            : SphereFeature[],
  sphereKeys               : SphereKeys[],
  sphereTrackingNumber     : SphereTrackingNumber[],
  stone                    : Stone[],
  stoneAbility             : StoneAbility[],
  stoneAbilityProperty     : StoneAbilityProperty[],
  stoneBehaviour           : StoneBehaviour[],
  stoneKeys                : StoneKey[],
  stoneSwitchState         : StoneSwitchState[],
  stoneEnergyData          : EnergyData[],
  stoneEnergyDataProcessed : EnergyDataProcessed[],
  toon                     : Toon[],
  user                     : User[],
}


function initRepositories() : RepositoryContainer {
  let app:                  AppRepository;
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
  let fingerprintV2:        FingerprintV2Repository;
  let firmware:             FirmwareRepository;
  let fsChunks:             FsChunksRepository;
  let fsFiles:              FsFilesRepository;
  let location:             LocationRepository;
  let message:              MessageRepository;
  let messageState:         MessageStateRepository;
  let messageUser:          MessageUserRepository;
  let messageV2:            MessageV2Repository;
  let messageRecipientUser: MessageRecipientUserRepository;
  let messageDeletedByUser: MessageDeletedByUserRepository;
  let messageReadByUser:    MessageReadByUserRepository;
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
  let stoneKeys:            StoneKeyRepository;
  let stoneEnergy:          EnergyDataRepository;
  let stoneEnergyProcessed: EnergyDataProcessedRepository;
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
  let messageV2Getter    = () : Promise<MessageV2Repository>      => { return new Promise((resolve, _) => { resolve(messageV2) })}
  let stoneSwitchGetter  = () : Promise<StoneSwitchStateRepository> => { return new Promise((resolve, _) => { resolve(stoneSwitchState) })}
  let fingerprintGetter  = () : Promise<FingerprintRepository>  => { return new Promise((resolve, _) => { resolve(fingerprint) })}
  let fsFilesGetter      = () : Promise<FsFilesRepository>      => { return new Promise((resolve, _) => { resolve(fsFiles) })}
  let messageUserGetter  = () : Promise<MessageUserRepository>  => { return new Promise((resolve, _) => { resolve(messageUser) })}
  let userGetter         = () : Promise<UserRepository>         => { return new Promise((resolve, _) => { resolve(user) })}


  hub                  = new HubRepository(testdb, sphereGetter, stoneGetter, locationGetter);
  crownstoneToken      = new CrownstoneTokenRepository(testdb);
  bootloader           = new BootloaderRepository(testdb);
  firmware             = new FirmwareRepository(testdb);
  oauthToken           = new OauthTokenRepository(testdb);

  appInstallation      = new AppInstallationRepository(testdb, deviceGetter);
  app                  = new AppRepository(testdb);
  devicePreferences    = new DevicePreferencesRepository(testdb, deviceGetter);
  fingerprintLinker    = new FingerprintLinkerRepository(testdb, sphereGetter, locationGetter, deviceGetter, fingerprintGetter);
  deviceSphereMap      = new DeviceSphereMapRepository(testdb, userGetter, deviceGetter, sphereGetter);
  deviceLocationMap    = new DeviceLocationMapRepository(testdb, userGetter, deviceGetter, sphereGetter, locationGetter);
  device               = new DeviceRepository(testdb, userGetter, appInstallation, fingerprintLinker, devicePreferences, deviceLocationMap, deviceSphereMap);
  fingerprint          = new FingerprintRepository(testdb, sphereGetter);
  fingerprintV2        = new FingerprintV2Repository(testdb, sphereGetter);
  fsFiles              = new FsFilesRepository(testdb);
  fsChunks             = new FsChunksRepository(testdb, fsFilesGetter);
  location             = new LocationRepository(testdb, sphereGetter, fingerprintV2);
  messageRecipientUser = new MessageRecipientUserRepository(testdb, sphereGetter, messageV2Getter, userGetter);
  messageReadByUser    = new MessageReadByUserRepository(testdb, sphereGetter, messageV2Getter, userGetter);
  messageDeletedByUser = new MessageDeletedByUserRepository(testdb, sphereGetter, messageV2Getter, userGetter);
  messageUser          = new MessageUserRepository(testdb, sphereGetter, messageGetter, userGetter);
  messageUser          = new MessageUserRepository(testdb, sphereGetter, messageGetter, userGetter);
  messageState         = new MessageStateRepository(testdb, sphereGetter, messageGetter, messageGetter, userGetter);
  message              = new MessageRepository(testdb, sphereGetter, userGetter, messageUserGetter, messageState);
  messageV2            = new MessageV2Repository(testdb, sphereGetter, userGetter, messageRecipientUser, messageDeletedByUser, messageReadByUser);
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
  stoneEnergy          = new EnergyDataRepository(testdb, sphereGetter, stoneGetter);
  stoneEnergyProcessed = new EnergyDataProcessedRepository(testdb, sphereGetter, stoneGetter);
  stone                = new StoneRepository(testdb, sphereGetter, locationGetter, stoneSwitchGetter, stoneBehaviour, stoneAbility, stoneSwitchState);
  toon                 = new ToonRepository(testdb, sphereGetter);

  sphere               = new SphereRepository(testdb, sphereAccessGetter, userGetter, stone, location, scene, fingerprintV2, messageV2, hub, sphereFeature, sphereTrackingNumber, toon);
  user                 = new UserRepository(testdb, sphereAccessGetter, sphereGetter, device);


  return {
    app,
    appInstallation,
    bootloader,
    crownstoneToken,
    device,
    deviceLocationMap,
    devicePreferences,
    deviceSphereMap,
    fingerprintV2,
    fingerprint,
    fingerprintLinker,
    firmware,
    fsChunks,
    fsFiles,
    hub,
    location,
    messageRecipientUser,
    messageReadByUser,
    messageDeletedByUser,
    messageV2,
    message,
    messageState,
    messageUser,
    oauthToken,
    scene,
    sphere,
    sphereAccess,
    sphereFeature,
    sphereKeys,
    sphereTrackingNumber,
    stone,
    stoneAbility,
    stoneAbilityProperty,
    stoneBehaviour,
    stoneKeys,
    stoneSwitchState,
    stoneEnergy,
    stoneEnergyProcessed,
    toon,
    user
  };
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

export async function databaseDump() : Promise<DatabaseDump> {
  let dbObject = getRepositories();
  let dbs = Object.keys(dbObject);
  let result : any = {}
  for (let i = 0; i < dbs.length; i++) {
    // @ts-ignore
    result[dbs[i]] = JSON.parse(JSON.stringify(await dbObject[dbs[i]].find()));
  }
  return result;
}
export async function databasePureDump() : Promise<DatabaseDump> {
  let dbObject = getRepositories();
  let dbs = Object.keys(dbObject);
  let result : any = {}
  for (let i = 0; i < dbs.length; i++) {
    // @ts-ignore
    result[dbs[i]] = await dbObject[dbs[i]].find();
  }
  return result;
}

