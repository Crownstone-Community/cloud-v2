import {SphereRepository} from "../../repositories/data/sphere.repository";
import {AppInstallationRepository} from "../../repositories/data/app-installation.repository";
import {DevicePreferencesRepository} from "../../repositories/data/device-preferences.repository";
import {DeviceRepository} from "../../repositories/data/device.repository";
import {FingerprintLinkerRepository} from "../../repositories/data/fingerprint-linker.repository";
import {FingerprintRepository} from "../../repositories/data/fingerprint.repository";
import {LocationRepository} from "../../repositories/data/location.repository";
import {MessageRepository} from "../../repositories/data/message.repository";
import {MessageStateRepository} from "../../repositories/data/message-state.repository";
import {MessageUserRepository} from "../../repositories/data/message-user.repository";
import {SceneRepository} from "../../repositories/data/scene.repository";
import {SortedListRepository} from "../../repositories/data/sorted-list.repository";
import {SphereAccessRepository} from "../../repositories/data/sphere-access.repository";
import {SphereFeatureRepository} from "../../repositories/data/sphere-feature.repository";
import {SphereTrackingNumberRepository} from "../../repositories/data/sphere-tracking-number.repository";
import {SphereKeyRepository} from "../../repositories/data/sphere-key.repository";
import {StoneRepository} from "../../repositories/data/stone.repository";
import {StoneAbilityPropertyRepository} from "../../repositories/data/stone-ability-property.repository";
import {StoneAbilityRepository} from "../../repositories/data/stone-ability.repository";
import {StoneBehaviourRepository} from "../../repositories/data/stone-behaviour.repository";
import {StoneSwitchStateRepository} from "../../repositories/data/stone-switch-state.repository";
import {StoneKeyRepository} from "../../repositories/data/stone-key.repository";
import {PositionRepository} from "../../repositories/data/position.repository";
import {ToonRepository} from "../../repositories/data/toon.repository";
import {UserRepository} from "../../repositories/users/user.repository";
import {HubRepository} from "../../repositories/users/hub.repository";
import {CrownstoneTokenRepository} from "../../repositories/users/crownstone-token.repository";
import {CrownstoneCloud} from "../../application";

export interface RepositoryContainer {
  appInstallation:      AppInstallationRepository,
  crownstoneToken:      CrownstoneTokenRepository,
  devicePreferences:    DevicePreferencesRepository,
  device:               DeviceRepository,
  fingerprintLinker:    FingerprintLinkerRepository,
  fingerprint:          FingerprintRepository,
  hub:                  HubRepository,
  location:             LocationRepository,
  message:              MessageRepository,
  messageState:         MessageStateRepository,
  messageUser:          MessageUserRepository,
  scene:                SceneRepository,
  sortedList:           SortedListRepository,
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
  position:             PositionRepository,
  toon:                 ToonRepository,
  user:                 UserRepository,
}

export let Dbs : RepositoryContainer = {
  appInstallation:      null,
  crownstoneToken:      null,
  devicePreferences :   null,
  device :              null,
  fingerprintLinker:    null,
  fingerprint:          null,
  hub:                  null,
  location:             null,
  message:              null,
  messageState:         null,
  messageUser:          null,
  scene:                null,
  sortedList:           null,
  sphereAccess:         null,
  sphereFeature:        null,
  sphereTrackingNumber: null,
  sphereKeys:           null,
  sphere :              null,
  stone:                null,
  stoneAbilityProperty: null,
  stoneAbility:         null,
  stoneBehaviour:       null,
  stoneSwitchState:     null,
  stoneKeys:            null,
  position:             null,
  toon:                 null,
  user:                 null,
};

export async function PopulateRepositoryContainer(app: CrownstoneCloud) {
  Dbs.appInstallation      = await app.getRepository(AppInstallationRepository);
  Dbs.crownstoneToken      = await app.getRepository(CrownstoneTokenRepository);
  Dbs.devicePreferences    = await app.getRepository(DevicePreferencesRepository);
  Dbs.device               = await app.getRepository(DeviceRepository);
  Dbs.fingerprintLinker    = await app.getRepository(FingerprintLinkerRepository);
  Dbs.fingerprint          = await app.getRepository(FingerprintRepository);
  Dbs.hub                  = await app.getRepository(HubRepository);
  Dbs.location             = await app.getRepository(LocationRepository);
  Dbs.message              = await app.getRepository(MessageRepository);
  Dbs.messageState         = await app.getRepository(MessageStateRepository);
  Dbs.messageUser          = await app.getRepository(MessageUserRepository);
  Dbs.scene                = await app.getRepository(SceneRepository);
  Dbs.sortedList           = await app.getRepository(SortedListRepository);
  Dbs.sphereAccess         = await app.getRepository(SphereAccessRepository);
  Dbs.sphereFeature        = await app.getRepository(SphereFeatureRepository);
  Dbs.sphereTrackingNumber = await app.getRepository(SphereTrackingNumberRepository);
  Dbs.sphereKeys           = await app.getRepository(SphereKeyRepository);
  Dbs.sphere               = await app.getRepository(SphereRepository);
  Dbs.stone                = await app.getRepository(StoneRepository);
  Dbs.stoneAbilityProperty = await app.getRepository(StoneAbilityPropertyRepository);
  Dbs.stoneAbility         = await app.getRepository(StoneAbilityRepository);
  Dbs.stoneBehaviour       = await app.getRepository(StoneBehaviourRepository);
  Dbs.stoneSwitchState     = await app.getRepository(StoneSwitchStateRepository);
  Dbs.stoneKeys            = await app.getRepository(StoneKeyRepository);
  Dbs.position             = await app.getRepository(PositionRepository);
  Dbs.toon                 = await app.getRepository(ToonRepository);
  Dbs.user                 = await app.getRepository(UserRepository);
}


























