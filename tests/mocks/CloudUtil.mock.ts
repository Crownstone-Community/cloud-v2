import crypto from "crypto";


let RANDOM_COUNT = 2000;
export function restMockRandom() {
  RANDOM_COUNT = 2000;
}


let databaseList = {};
export function makeUtilDeterministic() {
  jest.mock("../../src/util/CloudUtil", () => {
    return {
      CloudUtil: {
        createKey: function() : string {
          return 'key' + RANDOM_COUNT++;
        },

        createIBeaconUUID() : string {
          return 'ibeaconUUID' + RANDOM_COUNT++;
        },

        createToken: function() : string {
          return crypto.randomBytes(32).toString('hex');
        },

        createId: function(source) : string {
          if (databaseList[source] === undefined) {
            databaseList[source] = 1;
          }
          return 'dbId:' + source + ':' + databaseList[source]++;
        },

        hashPassword(plaintextPassword: string) : string {
          let shasum = crypto.createHash('sha1');
          shasum.update(String(plaintextPassword));
          let hashedPassword = shasum.digest('hex');
          return hashedPassword;
        }
      }
    }
  })
}

export function generateName() {
  return "RAN" + RANDOM_COUNT++;
}