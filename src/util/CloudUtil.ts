import * as crypto from "crypto";
const uuid = require('node-uuid');


export const CloudUtil = {
  createKey: function() : string {
    return crypto.randomBytes(16).toString('hex');
  },

  createIBeaconUUID() : string {
    return uuid.v4();
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