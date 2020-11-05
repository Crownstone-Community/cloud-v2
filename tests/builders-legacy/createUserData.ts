// mock the endpoind REST uses
import {Crownstone} from "crownstone-cloud/dist/dataContainers/crownstone";

jest.mock('../../node_modules/crownstone-cloud/dist/config', () => {
  return {
    CLOUD_ADDRESS: 'http://localhost:3000/api/',
  }
});

import {CrownstoneCloud, REST} from "crownstone-cloud";

function generateName() {
  return Math.floor(Math.random()*1e12).toString(36)
}

type REST_api = typeof REST;

export async function createUserData(name?) {
  if (!name) { name = generateName() }
  let cloud = new CrownstoneCloud('http://localhost:3000/api');
  cloud.log.config.setLevel('warn')
  try {
    let email = `testAccount+${name}@crownstone.rocks`;
    let password = 'hello';
    let user = await REST.registerUser({email: email, password: cloud.hashPassword(password)})
    let userId = user.id;
    REST.setUserId(userId);
    let login = await cloud.login(email, password);
    REST.setAccessToken(login.accessToken);

    let sphere = await createSphereData(REST, cloud)
    let device = await REST.createDevice({})

  }
  catch (e) {
    console.log("ERROR", e)
  }
}

export async function createSphereData(REST : REST_api, cloud: CrownstoneCloud) {
  let sphere = await REST.createSphere({name: generateName() })

  let sphereId = sphere.id;

  for (let i = 0; i < 5; i++) {
    let location = await REST.forSphere(sphereId).createLocation({name: generateName() })
    let stone = await REST.forSphere(sphereId).createStone({name: generateName(), address: generateName(), locationId: location.id})
    await REST.forStone(stone.id).createBehaviour({
      "type": "BEHAVIOUR",
      "data": {
        time: {
          type: 'RANGE',
          from: { type: 'SUNSET', offsetMinutes: 0 },
          to: { type: 'CLOCK', data:{hours:1,minutes:0}}
        },
        presence: { type: 'IGNORE' },
        action: { type: 'BE_ON', data: 100 }
      },
      "idOnCrownstone": 0,
      "profileIndex": 0,
      sphereId:sphereId,
      "syncedToCrownstone": true,
      "deleted": false,
      "activeDays": {
        "Mon": true,
        "Tue": false,
        "Wed": true,
        "Thu": false,
        "Fri": true,
        "Sat": true,
        "Sun": true
      }
    })
  }
  return sphere
}