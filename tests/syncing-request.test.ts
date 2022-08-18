import {CONFIG} from "../src/config";
CONFIG.emailValidationRequired = false;
CONFIG.generateCustomIds = true;

import {mockSSEmanager} from "./mocks/SSE";
mockSSEmanager();
import {SSEManager} from "../src/modules/sse/SSEManager";

import {makeUtilDeterministic, resetMockDatabaseIds, resetMockRandom} from "./mocks/CloudUtil.mock";
makeUtilDeterministic();

import {CrownstoneCloud} from "../src/application";
import {Client, createRestAppClient} from '@loopback/testlab';
import {clearTestDatabase, createApp, databaseDump, getRepositories} from "./helpers";
import {
  createHub,
  createLocation,
  createMessage,
  createSphere,
  createStone,
  createUser, readMessage,
  resetUsers
} from "./builders/createUserData";
import {auth, getToken, setAuthToUser} from "./rest-helpers/rest.helpers";
import {SyncHandler} from "../src/modules/sync/SyncHandler";
import {CloudUtil} from "../src/util/CloudUtil";
import { mocked } from 'ts-jest/utils'

let app    : CrownstoneCloud;
let client : Client;

let dbs;
let admin;
let member;
let guest;
let sphere;
let hub;
let stone,  behaviour,  ability,  abilityProperty;
let stone2, behaviour2, ability2, abilityProperty2;
let stone3, behaviour3, ability3, abilityProperty3;
let location;
let token;

async function populate() {
  // fill with a bit of data for sync
  dbs = getRepositories();
  admin    = await createUser('test@test.com', 'test', 0);
  member   = await createUser('member@test.com', 'test', 0);
  guest    = await createUser('guest@test.com', 'test', 0);
  sphere   = await createSphere(admin.id, 'mySphere', 0);
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: member.id, role:'member', sphereAuthorizationToken: CloudUtil.createToken()});
  await dbs.sphereAccess.create({sphereId: sphere.id, userId: guest.id, role:'guest', sphereAuthorizationToken: CloudUtil.createToken()});
  hub      = await createHub(sphere.id, 'myHub', 0);
  ({stone, behaviour, ability, abilityProperty} = await createStone(sphere.id, 'stone1', 0));
  ({stone: stone2, behaviour: behaviour2, ability: ability2, abilityProperty: abilityProperty2} = await createStone(sphere.id, 'stone2', 0));
  ({stone: stone3, behaviour: behaviour3, ability: ability3, abilityProperty: abilityProperty3} = await createStone(sphere.id, 'stone3', 0));
  location = await createLocation(sphere.id, 'location', 0);

  stone.locationId = location.id;
  await dbs.stone.update(stone)
  token  = await getToken(client, admin);
}

async function populateMinimal() {
  admin    = await createUser('test@test.com', 'test', 0);
  sphere   = await createSphere(admin.id, 'mySphere', 0);
}


beforeEach(async () => {
  mocked(SSEManager.emit).mockReset();
  await clearTestDatabase();
  resetUsers();
  resetMockRandom();
  resetMockDatabaseIds();
})
beforeAll(async () => {
  app    = await createApp()
  client = createRestAppClient(app);
})
afterAll(async () => { await app.stop(); })



test("Sync REQUEST with no body", async () => {
  await populate();
  await client.post(auth("/sync")).expect(400).expect(({body}) => { expect(body.error.code).toBe("MISSING_REQUIRED_PARAMETER")})
})

test("Sync REQUEST with no data", async () => {
  await populate();
  await client.post(auth("/sync")).send({sync: {type:"REQUEST"}})
    .expect(({body}) => {
      expect(body).toMatchSnapshot();})
})

test("Sync REQUEST with sphere and hub scope and no data", async () => {
  await populate();
  let sphereId = sphere.id;
  await client.post(auth("/sync")).send({sync: {type: "REQUEST", scope: ['spheres','hubs']}})
    .expect(({body}) => {
      let sphere = body.spheres[sphereId];
      expect(Object.keys(sphere)).toEqual(['data','hubs'])
      expect(body).toMatchSnapshot();
    })
});


test("Sync REQUEST with just hub scope and no data", async () => {
  await populate();
  let sphereId = sphere.id;
  await client.post(auth("/sync")).send({sync: {type: "REQUEST", scope: ['hubs']}})
    .expect(({body}) => {
      let sphere = body.spheres[sphereId];
      expect(Object.keys(sphere)).toEqual(['hubs'])
      expect(body).toMatchSnapshot();
    })
});


test("Sync REQUEST with just hub scope and empty data", async () => {
  await populate();
  let sphereId = sphere.id;
  await client.post(auth("/sync")).send({sync: {type: "REQUEST", scope: ['hubs']}, spheres: {[sphere.id]: {hubs:{}}}})
    .expect(({body}) => {
      let sphere = body.spheres[sphereId];
      expect(Object.keys(sphere)).toEqual(['hubs'])
      expect(body).toMatchSnapshot();
      // console.log(JSON.stringify(body, undefined, 2))
    })
});



test("Sync REQUEST with request body", async () => {
  await populate();
  let request = {
    sync: {type: 'REQUEST'},
    user: {data: {updatedAt: 0}},
    spheres: {
      [sphere.id]: {
        data: {updatedAt: 0},
        hubs: {
          [hub.id]: {data: {updatedAt: 0}}
        },
        locations: {
          [location.id]: {data: {updatedAt: 0}}
        },
        scenes: {
          "my-new-scene-id": {data: {updatedAt: 0}}
        },
        stones: {
          [stone.id]: {
            data: {updatedAt: 0},
            behaviours: {[behaviour.id]: {data: {updatedAt: 0},}},
            abilities: {
              [ability.id]: {
                data: {updatedAt: 0},
                properties: {
                  [abilityProperty.id]: {data: {updatedAt: 0},},
                }
              }
            }
          },
          [stone2.id]: {data: {updateAt: 0}}
        },
      }
    }
  }
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body).toMatchSnapshot();
      expect(body.spheres[sphere.id].data.status).toBe("IN_SYNC")
      expect(body.spheres[sphere.id].hubs[hub.id].data.status).toBe("IN_SYNC")
      expect(body.spheres[sphere.id].locations[location.id].data.status).toBe("IN_SYNC")
      expect(body.spheres[sphere.id].scenes["my-new-scene-id"].data.status).toBe("NOT_AVAILABLE")
      expect(body.spheres[sphere.id].stones[stone.id].data.status).toBe("IN_SYNC")
      expect(body.spheres[sphere.id].stones[stone.id].behaviours[behaviour.id].data.status).toBe("IN_SYNC")
      expect(body.spheres[sphere.id].stones[stone2.id].data.status).toBe("IN_SYNC")
      expect(body.spheres[sphere.id].stones[stone3.id].data.status).toBe("NEW_DATA_AVAILABLE")
    })
})


test("Sync REQUEST with request body and new items created in the cloud", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' },
    spheres: {
      [sphere.id]: {
        stones: {
          [stone.id]: {
            data: {updatedAt: 0},
            behaviours: {[behaviour.id]: {data: {updatedAt: 0}, }},
            abilities: {[ability.id]: {
                data: {updatedAt: 0},
                properties: {
                  [abilityProperty.id]: {data: {updatedAt: 0}, },
                }
              }}
          },
        },
      }
    }
  }

  let newProp = await dbs.stoneAbilityProperty.create({stoneId: stone.id, abilityId: ability.id, sphereId: sphere.id, type:"test", value:"hello"})
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones[stone.id]).toMatchSnapshot();
      expect(body.spheres[sphere.id].stones[stone.id].abilities[ability.id].properties[newProp.id].data.status).toBe("NEW_DATA_AVAILABLE")
    })

  let newAbility = await dbs.stoneAbility.create({stoneId: stone.id, sphereId: sphere.id, type:"test", enabled: true, syncedToCrownstone: true})
  let newProp2   = await dbs.stoneAbilityProperty.create({stoneId: stone.id, abilityId: newAbility.id, sphereId: sphere.id, type:"test", value:"hello"})
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones[stone.id]).toMatchSnapshot();
      expect(body.spheres[sphere.id].stones[stone.id].abilities[newAbility.id].data.status).toBe("NEW_DATA_AVAILABLE")
      expect(body.spheres[sphere.id].stones[stone.id].abilities[newAbility.id].properties[newProp2.id].data.status).toBe("NEW_DATA_AVAILABLE")
    })
});


test("Sync REQUEST with request body and new items without permission", async () => {
  await populate();
  await setAuthToUser(client, guest)
  let request = {
    sync: { type: 'REQUEST' },
    spheres: {
      [sphere.id]: {
        stones: {
          ['hello']: {
            new: true,
            data: {updatedAt: 0, address:'yes!'},
            abilities: {['who']: {
                data: {type:"test", enabled:true, syncedToCrownstone: true, updatedAt: 0},
                properties: {
                  ['ack']: {data: {type:"proppy", value:"Yes", updatedAt: 0}, },
                }
              }}
          },
        },
      }
    }
  }
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones['hello'].data.status).toBe('ACCESS_DENIED');
      expect(body.spheres[sphere.id].stones['hello'].abilities).toBeUndefined();
    })
});


test("Sync REQUEST with request body and new items from app, propagate new", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' },
    spheres: {
      [sphere.id]: {
        stones: {
          ['hello']: {
            new: true,
            data: {updatedAt: 0, name:'frank', address:'yes!'},
            abilities: {['who']: {
              data: {type:"test", enabled:true, syncedToCrownstone: true, updatedAt: 0},
              properties: {
                ['ack']: {data: {type:"proppy", value:"Yes", updatedAt: 0}, },
              }
            }}
          },
        },
      }
    }
  }

  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones['hello']).toMatchSnapshot();
      expect(body.spheres[sphere.id].stones['hello'].data.status).toBe('CREATED_IN_CLOUD');
      expect(body.spheres[sphere.id].stones['hello'].abilities['who'].data.status).toBe('CREATED_IN_CLOUD');
      expect(body.spheres[sphere.id].stones['hello'].abilities['who'].properties['ack'].data.status).toBe('CREATED_IN_CLOUD');
    })

  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(1);
  expect(mocked(SSEManager.emit).mock.calls[0][0]).toStrictEqual(
    {
      type:'dataChange',
      subType:'stones',
      operation:'create',
      sphere: {
        id:'dbId:SphereRepository:1',
        name:'mySphere',
        uid: 212
      },
      changedItem: {
        id: "dbId:StoneRepository:4",
        name: 'frank',
      }
    })
});


test("Sync REQUEST with request and creation", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' },
    spheres: {
      [sphere.id]: {
        scenes: {
          "my-new-scene-id": {new : true, data: {name: "AWESOME", updatedAt: 0}}
        }
      }
    }
  }
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].scenes["my-new-scene-id"].data.status).toBe("CREATED_IN_CLOUD")
    })

  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(0);
  let scenes = await dbs.scene.find();
  expect(scenes).toHaveLength(1)
  expect(scenes[0].name).toBe("AWESOME");
});


test("Sync REQUEST with request and creation outside of scope", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST', scope: ['hubs'] },
    spheres: {
      [sphere.id]: {
        scenes: {
          "my-new-scene-id": {new : true, data: {name: "AWESOME", updatedAt: 0}}
        }
      }
    }
  }
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(0);
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].scenes).toBeUndefined()
    })

  let scenes = await dbs.scene.find();
  expect(scenes).toHaveLength(0)
});


test("Sync REQUEST with request and creation with invalid payload", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' as SyncType },
    spheres: {
      [sphere.id]: {
        stones: {
          "my-new-stone-id": {new : true, data: {name: "AWESOME", updatedAt: 0}}
        }
      }
    }
  }
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].stones['my-new-stone-id'].data.status).toBe("ERROR");
      expect(body.spheres[sphere.id].stones['my-new-stone-id'].data.error.code).toBe(422);
    })

  let scenes = await dbs.stone.find();
  expect(scenes).toHaveLength(3) // only those we already have.
});

test("Sync REQUEST with unknown sphereId (delete interrupt sphere)", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' as SyncType },
    spheres: {
      ["unknown"]: {
        stones: {
          "my-new-stone-id": {new : true, data: {name: "AWESOME", updatedAt: 0}}
        }
      }
    }
  }
  let result = await SyncHandler.handleSync(admin.id, request as any);
  expect(result.spheres["unknown"].data.status).toBe("NOT_AVAILABLE");
  expect(Object.keys(result.spheres["unknown"])).toHaveLength(1);
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(0);
});

test("Sync REQUEST with unknown stoneId (delete interrupt stone)", async () => {
  await populate();
  let request = {
    sync: { type: 'REQUEST' as SyncType },
    spheres: {
      [sphere.id]: {
        stones: {
          ["unknown"]: {data: {name: "AWESOME", updatedAt: 0}}
        }
      }
    }
  }
  let result = await SyncHandler.handleSync(admin.id, request as any);
  expect(result.spheres[sphere.id].stones['unknown'].data.status).toBe("NOT_AVAILABLE");
  expect(Object.keys(result.spheres[sphere.id].stones['unknown'])).toHaveLength(1);
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(0);
});

test("Sync REQUEST with unknown abilityId (delete interrupt ability)", async () => {
  await populate();
  let request = {
    sync: {type: 'REQUEST'},
    spheres: {
      [sphere.id]: {
        stones: {
          [stone.id]: {
            data: {updatedAt: 0},
            behaviours: {[behaviour.id]: {data: {updatedAt: 0},}},
            abilities: {
              ["unknown"]: {
                data: {updatedAt: 0},
                properties: {
                  [abilityProperty.id]: {data: {updatedAt: 0},},
                }
              }
            }
          },
        },
      }
    }
  }
  let result = await SyncHandler.handleSync(admin.id, request as any);
  expect(result.spheres[sphere.id].stones[stone.id].abilities['unknown'].data.status).toBe("NOT_AVAILABLE");
  expect(Object.keys(result.spheres[sphere.id].stones[stone.id].abilities['unknown'])).toHaveLength(1);
  expect(mocked(SSEManager.emit)).toHaveBeenCalledTimes(0);
});


test("Sync REQUEST with multiple linked new files", async () => {
  await populateMinimal();
  let request = {
    sync: {type: 'REQUEST'},
    spheres: {
      [sphere.id]: {
        stones: {
          ["newStone"]: {
            new: true,
            data: {updatedAt: 0, address:'address', locationId:"newLocation"},
          },
        },
        locations: {
          ["newLocation"]: {
            new: true,
            data: {name:"fred", updatedAt: 0},
          },
        },
      }
    }
  }

  let result = await SyncHandler.handleSync(admin.id, request as any);
  expect(result.spheres[sphere.id].stones['newStone'].data.data.locationId).toBe('dbId:LocationRepository:1')
  expect(result.spheres[sphere.id].locations['newLocation'].data.data.id).toBe('dbId:LocationRepository:1')
});


test("Sync REQUEST after something updated an existing item", async () => {
  await populate();
  let request = {
    sync: {type: 'REQUEST',scope:['hubs']},
    spheres: {
      [sphere.id]: {
        hubs: {
          [hub.id]: {data: {updatedAt: 0}}
        },
      }
    }
  }

  hub.name = 'UpdatedHub';
  hub.updatedAt = new Date(10000000);

  await dbs.hub.update(hub, {acceptTimes: true});

  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.spheres[sphere.id].hubs[hub.id].data.status).toBe("NEW_DATA_AVAILABLE")
      expect(body.spheres[sphere.id].hubs[hub.id].data.data.name).toBe("UpdatedHub")
    })
});





test("Sync REQUEST keys", async () => {
  await populate();
  let request = {sync: {type: 'REQUEST',scope:['keys']}, spheres: {}}

  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.keys).toBeDefined()
      expect(body.keys.data.length).toBe(1)
      expect(body.keys.data[0].sphereKeys.length).toBe(7)
    })

  token  = await getToken(client, member);
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.keys).toBeDefined()
      expect(body.keys.data.length).toBe(1)
      expect(body.keys.data[0].sphereKeys.length).toBe(4)
    })

  token  = await getToken(client, guest);
  await client.post(auth("/sync")).send(request)
    .expect(({body}) => {
      expect(body.keys).toBeDefined()
      expect(body.keys.data.length).toBe(1)
      expect(body.keys.data[0].sphereKeys.length).toBe(3)
    })

});



test("Sync REQUEST messages", async () => {
  await populate();
  let message = await createMessage(admin.id, sphere.id, "HelloAdmin", [admin.id, member.id]);
  await readMessage(admin.id, sphere.id, message.id );

  let adminToken = await getToken(client, admin);
  let guestToken = await getToken(client, guest);

  // check if we get the message as new data.
  let request = {sync: {type: 'REQUEST',scope:['messages']}, spheres: {[sphere.id]: {}}}
  await client.post(auth("/sync", adminToken)).send(request).expect(({body}) => { expect(body).toMatchSnapshot('check if we get the message as new data'); })

  // check if the message is in sync
  let request2 = {sync: {type: 'REQUEST',scope:['messages']}, spheres: {[sphere.id]: {messages:{[message.id]:{data: {updatedAt: message.updatedAt}}}}}}
  await client.post(auth("/sync", adminToken)).send(request2).expect(({body}) => { expect(body).toMatchSnapshot('check if the message is in sync'); })

  // check if we only get our own messages
  let request3 = {sync: {type: 'REQUEST',scope:['messages']}, spheres: {[sphere.id]: {messages:{[message.id]:{data: {updatedAt: message.updatedAt}}}}}}
  await client.post(auth("/sync", guestToken)).send(request3).expect(({body}) => { expect(body).toMatchSnapshot('check if we only get our own messages'); })

  // check if we can mark a deleted state:
  let request4 = {
    sync: {type: 'REQUEST', scope: ['messages']},
    spheres: {
      [sphere.id]: {
        messages: {
          [message.id]: {
            data: {updatedAt: message.updatedAt},
            deletedBy: {'newId': {
              new: true,
              data: {userId: admin.id, updatedAt: new Date(message.updatedAt).valueOf() + 100}
            }},
          }
        }
      }
    }
  };
  await client.post(auth("/sync", adminToken)).send(request4).expect(({body}) => { expect(body).toMatchSnapshot('check if we can mark a deleted state'); })
  let message2 = await createMessage(admin.id, sphere.id, "HelloAdmin2", [admin.id, member.id]);

  // check if we can mark a deleted state for someone else:
  let request5 = {
    sync: {type: 'REQUEST', scope: ['messages']},
    spheres: {
      [sphere.id]: {
        messages: {
          [message2.id]: {
            data: {updatedAt: message2.updatedAt},
            deletedBy: {'newId': {
              new: true,
              data: {userId: member.id, updatedAt: new Date(message2.updatedAt).valueOf() + 100}
            }},
          }
        }
      }
    }
  };
  await client.post(auth("/sync", adminToken)).send(request5).expect(({body}) => {
    // the user is not allowed to delete messages of other users, the ID is forced to be the same as the userId from the syncing user.
    expect(body?.spheres?.[sphere.id]?.messages?.[message2.id]?.deletedBy?.['newId']?.data?.data?.userId).toBe(admin.id)

    expect(body).toMatchSnapshot('check if we can mark a deleted state for someone else')
  })
});








test("Sync REQUEST messages, create message via sync", async () => {
  await populate();
  // check if we can mark a deleted state for someone else:
  let request6 = {
    sync: {type: 'REQUEST', scope: ['messages']},
    spheres: {
      [sphere.id]: {
        messages: {
          ['newMessageId1']: {
            new: true,
            data: {content:'hello', everyoneInSphere:false, recipients:[guest.id]},
          }
        }
      }
    }
  };
  await client.post(auth("/sync")).send(request6).expect(({body}) => {
    let messages = body.spheres[sphere.id].messages;
    expect(messages.newMessageId1.data.status).toBe("CREATED_IN_CLOUD");
    expect(messages.newMessageId1.data.data.recipients).toBeDefined();
    expect(body).toMatchSnapshot();
  })


});






