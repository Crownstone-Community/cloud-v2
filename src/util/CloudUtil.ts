import * as crypto from "crypto";
const uuid = require('node-uuid');


export const CloudUtil = {
  createKey: function() : string {
    return crypto.randomBytes(16).toString('hex');
  },

  createIBeaconUUID() : string {
    return uuid.v4();
  },

  createShortUID() : number {
    let rand = crypto.randomBytes(1)
    return rand.readUInt8(0);
  },

  createIBeaconMinor() : number {
    let rand = crypto.randomBytes(2)
    return rand.readUInt16LE(0);
  },

  createIBeaconMajor() : number {
    return CloudUtil.createIBeaconMinor();
  },

  createToken: function() : string {
    return crypto.randomBytes(32).toString('hex');
  },

  createId: function(source? : any) : string {
    return crypto.randomBytes(12).toString('hex');
  },

  getDate() {
    return new Date();
  },

  hashPassword(plaintextPassword: string) : string {
    let shasum = crypto.createHash('sha1');
    shasum.update(String(plaintextPassword));
    let hashedPassword = shasum.digest('hex');
    return hashedPassword;
  }
}