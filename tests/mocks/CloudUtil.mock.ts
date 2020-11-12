import crypto from "crypto";


let RANDOM_COUNT = 2000;
let DATABASE_LIST = {};
let GLOBAL_TIME = 0;
export function resetMockRandom() {
  RANDOM_COUNT = 2000;
}
export function resetMockDatabaseIds() {
  DATABASE_LIST = {};
}

export function setDate(time) {
  GLOBAL_TIME = time;
}

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

        createShortUID() : number {
          return RANDOM_COUNT++ % 256;
        },

        createIBeaconMinor() : number {
          return RANDOM_COUNT++;
        },

        createIBeaconMajor() : number {
          return RANDOM_COUNT++;
        },

        createId: function(source) : string {
          if (DATABASE_LIST[source] === undefined) {
            DATABASE_LIST[source] = 1;
          }
          return 'dbId:' + source + ':' + DATABASE_LIST[source]++;
        },

        getDate() {
          return new Date(GLOBAL_TIME);
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