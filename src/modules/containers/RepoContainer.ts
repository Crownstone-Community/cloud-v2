import {SphereRepository}               from "../../repositories/data/sphere.repository";
import {AppInstallationRepository}      from "../../repositories/data/app-installation.repository";
import {DevicePreferencesRepository}    from "../../repositories/data/device-preferences.repository";
import {DeviceRepository}               from "../../repositories/data/device.repository";
import {FingerprintLinkerRepository}    from "../../repositories/data/fingerprint-linker.repository";
import {FingerprintRepository}          from "../../repositories/data/fingerprint.repository";
import {LocationRepository}             from "../../repositories/data/location.repository";
import {MessageRepository}              from "../../repositories/data/message.repository";
import {MessageStateRepository}         from "../../repositories/data/message-state.repository";
import {MessageUserRepository}          from "../../repositories/data/message-user.repository";
import {SceneRepository}                from "../../repositories/data/scene.repository";
import {SphereAccessRepository}         from "../../repositories/data/sphere-access.repository";
import {SphereFeatureRepository}        from "../../repositories/data/sphere-feature.repository";
import {SphereTrackingNumberRepository} from "../../repositories/data/sphere-tracking-number.repository";
import {SphereKeyRepository}            from "../../repositories/data/sphere-key.repository";
import {StoneRepository}                from "../../repositories/data/stone.repository";
import {StoneAbilityPropertyRepository} from "../../repositories/data/stone-ability-property.repository";
import {StoneAbilityRepository}         from "../../repositories/data/stone-ability.repository";
import {StoneBehaviourRepository}       from "../../repositories/data/stone-behaviour.repository";
import {StoneSwitchStateRepository}     from "../../repositories/data/stone-switch-state.repository";
import {StoneKeyRepository}             from "../../repositories/data/stone-key.repository";
import {ToonRepository}                 from "../../repositories/data/toon.repository";
import {UserRepository}                 from "../../repositories/users/user.repository";
import {HubRepository}                  from "../../repositories/users/hub.repository";
import {CrownstoneTokenRepository}      from "../../repositories/users/crownstone-token.repository";
import {CrownstoneCloud}                from "../../application";
import {FirmwareRepository}             from "../../repositories/data/firmware.repository";
import {BootloaderRepository}           from "../../repositories/data/bootloader.repository";
import {OauthTokenRepository}           from "../../repositories/users/oauth-token.repository";
import {DeviceLocationMapRepository}    from "../../repositories/data/device-location-map.repository";
import {DeviceSphereMapRepository}      from "../../repositories/data/device-sphere-map.repository";
import {FsChunksRepository}             from "../../repositories/files/fs.chunks.repository";
import {FsFilesRepository}              from "../../repositories/files/fs.files.repository";
import { FingerprintV2Repository }      from "../../repositories/data/fingerprint-v2.repository";
import {MessageV2Repository}            from "../../repositories/data/messageV2.repository";
import {MessageRecipientUserRepository} from "../../repositories/data/message-recipient-user.repository";
import {MessageDeletedByUserRepository} from "../../repositories/data/message-deletedBy-user.repository";
import {MessageReadByUserRepository}    from "../../repositories/data/message-readBy-user.repository";
import {AppRepository}                  from "../../repositories/data/app.repository";
import {EnergyDataRepository}           from "../../repositories/data/stone-energy-data.repository";
import {EnergyDataProcessedRepository}  from "../../repositories/data/stone-energy-data-processed.repository";
import {EnergyMetaDataRepository}       from "../../repositories/data/stone-energy-metadata.repository";
import {MetaDataRepository}             from "../../repositories/data/metadata.repository";

export interface RepositoryContainer {
  app:                  AppRepository,
  appInstallation:      AppInstallationRepository,
  bootloader:           BootloaderRepository,
  oauthToken:           OauthTokenRepository,
  crownstoneToken:      CrownstoneTokenRepository,
  devicePreferences:    DevicePreferencesRepository,
  deviceLocationMap:    DeviceLocationMapRepository,
  deviceSphereMap:      DeviceSphereMapRepository,
  device:               DeviceRepository,
  fingerprintLinker:    FingerprintLinkerRepository,
  fingerprint:          FingerprintRepository,
  fingerprintV2:        FingerprintV2Repository,
  firmware:             FirmwareRepository,
  fsChunks:             FsChunksRepository,
  fsFiles:              FsFilesRepository,
  hub:                  HubRepository,
  location:             LocationRepository,
  messageV2:            MessageV2Repository,
  messageRecipientUser: MessageRecipientUserRepository,
  messageReadByUser:    MessageReadByUserRepository,
  messageDeletedByUser: MessageDeletedByUserRepository,
  message:              MessageRepository,
  messageState:         MessageStateRepository,
  messageUser:          MessageUserRepository,
  metaData:             MetaDataRepository,
  scene:                SceneRepository,
  sphereAccess:         SphereAccessRepository,
  sphereFeature:        SphereFeatureRepository,
  sphereTrackingNumber: SphereTrackingNumberRepository,
  sphereKeys:           SphereKeyRepository,
  sphere:               SphereRepository,
  stone:                StoneRepository,
  stoneAbilityProperty: StoneAbilityPropertyRepository,
  stoneAbility:         StoneAbilityRepository,
  stoneBehaviour:       StoneBehaviourRepository,
  stoneSwitchState:     StoneSwitchStateRepository,
  stoneKeys:            StoneKeyRepository,
  stoneEnergy:          EnergyDataRepository;
  stoneEnergyProcessed: EnergyDataProcessedRepository;
  stoneEnergyMetaData:  EnergyMetaDataRepository;
  toon:                 ToonRepository,
  user:                 UserRepository,
}


export let Dbs : RepositoryContainer = {
  app:                  null,
  appInstallation:      null,
  bootloader:           null,
  oauthToken:           null,
  crownstoneToken:      null,
  deviceLocationMap:    null,
  deviceSphereMap:      null,
  devicePreferences:    null,
  device:               null,
  fsChunks:             null,
  fsFiles:              null,
  fingerprintLinker:    null,
  fingerprint:          null,
  fingerprintV2:        null,
  firmware:             null,
  hub:                  null,
  location:             null,
  messageV2:            null,
  messageRecipientUser: null,
  messageReadByUser:    null,
  messageDeletedByUser: null,
  message:              null,
  messageState:         null,
  messageUser:          null,
  metaData:             null,
  scene:                null,
  sphereAccess:         null,
  sphereFeature:        null,
  sphereTrackingNumber: null,
  sphereKeys:           null,
  sphere:               null,
  stone:                null,
  stoneAbilityProperty: null,
  stoneAbility:         null,
  stoneBehaviour:       null,
  stoneSwitchState:     null,
  stoneKeys:            null,
  stoneEnergy:          null,
  stoneEnergyProcessed: null,
  stoneEnergyMetaData:  null,
  toon:                 null,
  user:                 null,
};

export async function PopulateRepositoryContainer(app: CrownstoneCloud) {
  Dbs.app                  = await app.getRepository( AppRepository );
  Dbs.appInstallation      = await app.getRepository( AppInstallationRepository );
  Dbs.bootloader           = await app.getRepository( BootloaderRepository );
  Dbs.oauthToken           = await app.getRepository( OauthTokenRepository );
  Dbs.crownstoneToken      = await app.getRepository( CrownstoneTokenRepository );
  Dbs.deviceLocationMap    = await app.getRepository( DeviceLocationMapRepository );
  Dbs.deviceSphereMap      = await app.getRepository( DeviceSphereMapRepository );
  Dbs.devicePreferences    = await app.getRepository( DevicePreferencesRepository );
  Dbs.device               = await app.getRepository( DeviceRepository );
  Dbs.fingerprintLinker    = await app.getRepository( FingerprintLinkerRepository );
  Dbs.fingerprint          = await app.getRepository( FingerprintRepository );
  Dbs.fingerprintV2        = await app.getRepository( FingerprintV2Repository );
  Dbs.firmware             = await app.getRepository( FirmwareRepository );
  Dbs.fsChunks             = await app.getRepository( FsChunksRepository );
  Dbs.fsFiles              = await app.getRepository( FsFilesRepository );
  Dbs.hub                  = await app.getRepository( HubRepository );
  Dbs.location             = await app.getRepository( LocationRepository );
  Dbs.messageV2            = await app.getRepository( MessageV2Repository );
  Dbs.messageRecipientUser = await app.getRepository( MessageRecipientUserRepository );
  Dbs.messageReadByUser    = await app.getRepository( MessageReadByUserRepository );
  Dbs.messageDeletedByUser = await app.getRepository( MessageDeletedByUserRepository );
  Dbs.message              = await app.getRepository( MessageRepository );
  Dbs.messageState         = await app.getRepository( MessageStateRepository );
  Dbs.messageUser          = await app.getRepository( MessageUserRepository );
  Dbs.metaData             = await app.getRepository( MetaDataRepository );
  Dbs.scene                = await app.getRepository( SceneRepository );
  Dbs.sphereAccess         = await app.getRepository( SphereAccessRepository );
  Dbs.sphereFeature        = await app.getRepository( SphereFeatureRepository );
  Dbs.sphereTrackingNumber = await app.getRepository( SphereTrackingNumberRepository );
  Dbs.sphereKeys           = await app.getRepository( SphereKeyRepository );
  Dbs.sphere               = await app.getRepository( SphereRepository );
  Dbs.stone                = await app.getRepository( StoneRepository );
  Dbs.stoneAbilityProperty = await app.getRepository( StoneAbilityPropertyRepository );
  Dbs.stoneAbility         = await app.getRepository( StoneAbilityRepository );
  Dbs.stoneBehaviour       = await app.getRepository( StoneBehaviourRepository );
  Dbs.stoneSwitchState     = await app.getRepository( StoneSwitchStateRepository );
  Dbs.stoneKeys            = await app.getRepository( StoneKeyRepository );
  Dbs.stoneEnergy          = await app.getRepository( EnergyDataRepository );
  Dbs.stoneEnergyMetaData  = await app.getRepository( EnergyMetaDataRepository );
  Dbs.stoneEnergyProcessed = await app.getRepository( EnergyDataProcessedRepository );
  Dbs.toon                 = await app.getRepository( ToonRepository );
  Dbs.user                 = await app.getRepository( UserRepository );
}
