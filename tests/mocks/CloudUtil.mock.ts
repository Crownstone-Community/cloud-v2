import crypto from "crypto";


let RANDOM_COUNT = 2000;
export function restMockRandom() {
  RANDOM_COUNT = 2000;
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