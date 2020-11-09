import {Dbs} from "../containers/RepoContainer";
import {HttpErrors} from "@loopback/rest";
import {SyncRequestReply, SyncRequestReply_Sphere} from "../../declarations/syncTypes";
import {User} from "../../models/user.model";
import {Sphere} from "../../models/sphere.model";

let FIELDS = [
  'sphere',
  {hubs:            ['hub']},
  {locations:       ['location', 'position']},
  {messages:        ['message']},
  {scenes:          ['scene']},
  {stones:          ['stone', {abilities: ['abilities','properties']},'behaviours']},
  {sortedLists:     ['sortedLists']},
  {sphereFeatures:  ['sphereFeatures']},
  {trackingNumbers: ['trackingNumbers']},
  {toons:           ['toons']},
]

let sphereRelationsMap : {[id:string]:boolean} = {
  features:        true,
  messages:        true,
  hubs:            true,
  scenes:          true,
  sortedLists:     true,
  trackingNumbers: true,
  toons:           true,
  locations:       true,
  stones:          true,
}



class Syncer {

  async downloadAll(userId: string) {
    let user   = await Dbs.user.findById(userId);
    let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});

    let sphereIds = [];

    for (let i = 0; i < access.length; i++) {
      sphereIds.push(access[i].sphereId);
    }

    let sphereData = await Dbs.sphere.find({
      where: {id: {inq: sphereIds }},
      include: [
        {relation:'features'},
        {relation:'locations', scope: {
          include: [
            {relation: 'sphereOverviewPosition'}
          ]}
        },
        {relation:'messages'},
        {relation:'hubs'},
        {relation:'scenes'},
        {relation:'sortedLists'},
        {relation:'stones', scope: {
          include: [
            {relation: 'behaviours'},
            {relation: 'abilities', scope: {include:[{relation:'properties'}]}},
            {relation: 'currentSwitchState'},
            {relation: 'location',  scope: {fields: {id:true, name: true} }}
          ]}
        },
        {relation:'trackingNumbers'},
        {relation:'toons'},
      ]
    });

    function injectSphereSimpleItem(sphere: Sphere, key: string, singular: string, sphereItem: any) {
      // @ts-ignore
      if (sphere[key] !== undefined) {
        sphereItem[key] = {branchInSync: false};
        // @ts-ignore
        for (let i = 0; i < sphere[key].length; i++) {
          // @ts-ignore
          let item = sphere[key][i];
          sphereItem[key][item.id] = {[singular]: {status: "VIEW", data: item}};
        }
      }
    }

    function parseSphere(sphere: Sphere) : SyncRequestReply_Sphere {
      let sphereItem : SyncRequestReply_Sphere = { sphere: { status: "VIEW", data: {}}};
      let sphereKeys = Object.keys(sphere);
      for (let i = 0; i < sphereKeys.length; i++) {
        let key = sphereKeys[i];
        if (sphereRelationsMap[key] === undefined) {
          // @ts-ignore
          sphereItem.sphere.data[key] = sphere[key];
        }
      }
      injectSphereSimpleItem(sphere, 'hubs',            'hub',            sphereItem);
      injectSphereSimpleItem(sphere, 'features',        'feature',        sphereItem);
      injectSphereSimpleItem(sphere, 'messages',        'message',        sphereItem);
      injectSphereSimpleItem(sphere, 'scenes',          'scene',          sphereItem);
      injectSphereSimpleItem(sphere, 'sortedLists',     'sortedList',     sphereItem);
      injectSphereSimpleItem(sphere, 'trackingNumbers', 'trackingNumber', sphereItem);
      injectSphereSimpleItem(sphere, 'toons',           'toon',           sphereItem);

      if (sphere['locations'] !== undefined) {
        sphereItem['locations'] = {branchInSync: false};
        for (let i = 0; i < sphere['locations'].length; i++) {
          let location = sphere['locations'][i];
          let locationData = {...location};
          delete locationData['sphereOverviewPosition'];
          sphereItem['locations'][location.id] = {
            branchInSync: false,
            location: {status: "VIEW", data: locationData},
          };
          if (location['sphereOverviewPosition']) {
            // @ts-ignore
            sphereItem['locations'][location.id]["position"] = {status: "VIEW", data: location['sphereOverviewPosition']};
          }
        }
      }

      if (sphere['stones'] !== undefined) {
        sphereItem['stones'] = {branchInSync: false};
        for (let i = 0; i < sphere['stones'].length; i++) {
          let stone = {...sphere['stones'][i]};
          let stoneData = {...stone};
          delete stoneData['abilities'];
          delete stoneData['behaviours'];

          sphereItem['stones'][stone.id] = {
            branchInSync: false,
            stone: {status: "VIEW", data: stoneData},
          };

          if (stone['behaviours']) {
            // @ts-ignore
            sphereItem['stones'][stone.id]["behaviours"] = { branchInSync: false };
            for (let j = 0; j < stone.behaviours.length; j++) {
              let behaviour = stone.behaviours[j];
              // @ts-ignore
              sphereItem['stones'][stone.id]["behaviours"][behaviour.id] = { behaviour: {status: "VIEW", data: behaviour }}
            }
          }

          if (stone['abilities']) {
            // @ts-ignore
            sphereItem['stones'][stone.id]["abilities"] = { branchInSync: false };
            for (let j = 0; j < stone.abilities.length; j++) {
              let ability = stone.abilities[j];
              let abilityData = {...ability};
              delete abilityData.properties;
              // @ts-ignore
              sphereItem['stones'][stone.id]["abilities"][ability.id] = { ability: {status: "VIEW", data: abilityData }};

              if (ability['properties']) {
                // @ts-ignore
                sphereItem['stones'][stone.id]["abilities"][ability.id]["properties"] = { branchInSync: false };
                for (let k = 0; k < ability.properties.length; k++) {
                  let property = ability.properties[k];
                  // @ts-ignore
                  sphereItem['stones'][stone.id]["abilities"][ability.id]["properties"][property.id] = { status: "VIEW", data: property };
                }
              }
            }
          }
        }
      }

      return sphereItem;
    }


    let result : SyncRequestReply = {
      user: { status: "VIEW", data: user },
      spheres: {},
    };
    for (let i = 0; i < sphereData.length; i++) {
      result.spheres[sphereData[i].id] = parseSphere(sphereData[i])
    }

    return result;
  }
  /**
   * This method will receive the initial sync request payload.
   *
   *
   * @param userId
   * @param dataStructure
   */
  async handleSync(userId: string, dataStructure: SyncRequest) : Promise<any | SyncRequestReply> {
    if (!dataStructure || Object.keys(dataStructure).length === 0) {
      return this.downloadAll(userId)
    }

    if (dataStructure.sync.type === "FULL") {
      return this.downloadAll(userId);
    } else if (dataStructure.sync.type === "REQUEST") {
      // return getRequestDataMap();
    } else if (dataStructure.sync.type === "REPLY") {
      // return getFullDataMap();
    } else {
      throw new HttpErrors.BadRequest("Sync type required. Must be either REQUEST REPLY or FULL")
    }



    // let syncData = dataStructure.sync;
    let userSync = dataStructure.user;
    if (!userSync) {
      throw new HttpErrors.BadRequest("User entry required.");
    }



    // if (dataStructure)
    // let access = await Dbs.sphereAccess.find({where: {userId: userId}, fields: {sphereId:true, userId: true, role:true}});



  }

  async replyPhase(userId: string) {

  }

}


function mapDataIntoFormat(input: SyncRequest) {

}

function getFullDataMap(input: SyncRequest, user: User, spheres: Sphere[]) {

}









export const SyncHandler = new Syncer();