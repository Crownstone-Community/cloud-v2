import { Server, Socket } from "socket.io"
import * as http from "http";
import Timeout = NodeJS.Timeout;
import * as crypto from "crypto";
import {Dbs} from "../containers/RepoContainer";
let config  = require('../config.' + (process.env.NODE_ENV || 'local'));

const S4 = function () {
  return Math.floor(Math.random() * 0x10000 /* 65536 */).toString(16);
};

const getShortUUID = function() {
  return (
    S4() + S4() + '-' +
    S4()
  );
}

const EVENT_ROOM_NAME = "/SSE_EVENTS";

const protocolTopics = {
  requestForOauthTokenCheck:  "requestForOauthTokenCheck",
  requestForAccessTokenCheck: "requestForAccessTokenCheck",
  authenticationRequest:      "authenticationRequest",
  event:                      "event",
}



class SSEManagerClass {
  io : Server;
  connections : {[id: string]: SSEConnection} = {};

  constructor() {
    this.io = null;
    this.connections = {};
  }

  init(server: http.Server) {
    this.io = new Server(server, { pingInterval: 4000, pingTimeout: 2000, transports:["websocket"], cookie:false })
    this.io.on('connect', (socket: Socket) => {
      let uid = getShortUUID()
      this.connections[uid] = new SSEConnection(socket, () => { delete this.connections[uid]; });
    });
  }

  emit(data: SseEvent) {
    this.io.sockets.in(EVENT_ROOM_NAME).emit(protocolTopics.event, data);
  }
}

export const SSEManager = new SSEManagerClass();


class SSEConnection {

  socket : Socket
  cleanup : () => void;
  authenticationTimeout : Timeout;
  handshake : string;

  constructor(socket: Socket, cleanup: () => void) {
    this.socket = null;
    this.cleanup = null;
    this.authenticationTimeout = null;
    this.handshake = null;

    this.handshake = crypto.randomBytes(16).toString('base64')

    this.socket = socket;
    this.cleanup = cleanup;

    // client gets 500 ms to authenticate
    this.authenticationTimeout = setTimeout(() => { this.destroy(); }, 500);

    // here we ensure only our SSE servers will connect to this socket before sending data.
    this.socket.emit(protocolTopics.authenticationRequest, this.handshake, (reply: string) => {
      if (this.authenticate(reply) === false) { this.destroy(); return; }
      clearTimeout(this.authenticationTimeout);

      // add to the list of sockets that can process SSE's
      this.socket.join(EVENT_ROOM_NAME);

      // check if an accesstoken is valid.
      this.socket.on(protocolTopics.requestForAccessTokenCheck, (token, callback) => {
        this.handleAccessTokenRequest(token, callback);
      })
      // check if an accesstoken is valid.
      this.socket.on(protocolTopics.requestForOauthTokenCheck, (token, callback) => {
        this.handleOauthTokenRequest(token, callback);
      })
    });

    this.socket.on("disconnect", () => { this.destroy(); });
  }


  destroy() {
    this.socket.disconnect(true);
    clearTimeout(this.authenticationTimeout);
    this.cleanup();
  }


  authenticate(reply: string) {
    let hasher = crypto.createHash('sha256');
    let output = hasher.update(this.handshake + config.SSEToken).digest('hex')
    return reply === output;
  }


  async _isValidAccessToken(token: string) : Promise<AccessModel> {
    let resultTokenData: AccessModel = {
      accessToken: token,
      ttl: 0,
      createdAt: new Date(),
      userId: null,
      spheres: {},
      scopes: ["all"],
    };

    // get the token from the db, if successful,
    let tokenData = await Dbs.crownstoneToken.findById(token);
    if (!tokenData) { throw "INVALID_TOKEN" }
    if (new Date().valueOf() < new Date(tokenData.created).valueOf() + tokenData.ttl*1000) {
      throw "EXPIRED_TOKEN"
    }
    resultTokenData.ttl = tokenData.ttl;
    resultTokenData.createdAt = tokenData.created;

    resultTokenData.userId = tokenData.userId;

    let access = await Dbs.sphereAccess.find({where: {and: [{userId: tokenData.userId}, {invitePending: {neq: true}}]}, fields: {sphereId: true}})

    for (let i = 0; i < access.length; i++) {
      resultTokenData.spheres[access[i].sphereId] = true;
    }
    return resultTokenData;
  }

  async _isValidOauthToken(token: string) : Promise<AccessModel> {
    let resultTokenData: AccessModel = {
      accessToken: token,
      ttl: 0,
      createdAt: new Date(),
      userId: null,
      spheres: {},
      scopes: [],
    };

    // get the token from the db, if successful,
    let tokenData = await Dbs.oauthToken.findById(token);
    if (!tokenData) { throw "INVALID_TOKEN" }
    if (new Date().valueOf() < new Date(tokenData.expiredAt).valueOf()) {
      throw "EXPIRED_TOKEN"
    }
    resultTokenData.ttl       = tokenData.expiresIn;
    resultTokenData.createdAt = tokenData.issuedAt;
    resultTokenData.userId    = tokenData.userId;
    resultTokenData.scopes    = tokenData.scopes as oauthScope[];

    let access = await Dbs.sphereAccess.find({where: {and: [{userId: tokenData.userId}, {invitePending: {neq: true}}]}, fields: {sphereId: true}})

    for (let i = 0; i < access.length; i++) {
      resultTokenData.spheres[access[i].sphereId] = true;
    }
    return resultTokenData;
  }

  handleAccessTokenRequest(token: string, callback: (result: any) => void) {
    this._isValidAccessToken(token)
      .then((result) => {
        if (!result) { throw "Invalid Token" }

        callback({code: 200, data: result});
      })
      .catch((err) => {
        return callback({code: 401, err: err});
      })
  }

  handleOauthTokenRequest(token: string, callback: (result: any) => void) {
    this._isValidOauthToken(token)
      .then((result) => {
        if (!result) { throw "Invalid Token" }

        callback({code: 200, data: result});
      })
      .catch((err) => {
        return callback({code: 401, err: err});
      })
  }
}
