import {Provider} from "@loopback/context";
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  authorize,
  Authorizer
} from "@loopback/authorization";
import {Dbs} from "../../modules/containers/RepoContainer";
import {securityId} from "@loopback/security";

export const Authorization = {
  sphereAccess: (scopes?: string[]) => { return { scopes: scopes ?? [], allowedRoles: ['guest','basic','hub','member','admin']}},
  sphereMember: (scopes?: string[]) => { return { scopes: scopes ?? [], allowedRoles: ['hub','member','admin']}},
  sphereAdmin:  (scopes?: string[]) => { return { scopes: scopes ?? [], allowedRoles: ['admin']}},
  sphereHub:    (scopes?: string[]) => { return { scopes: scopes ?? [], allowedRoles: ['hub','admin']}},
}

export class MyAuthorizationProvider implements Provider<Authorizer> {
  /**
   * @returns an authorizer function
   *
   */
  value(): Authorizer {
    return this.authorize.bind(this);
  }

  async authorize(
    context: AuthorizationContext,
    metadata: AuthorizationMetadata,
  ) {
    // TODO: Add OAUTH scope checking
    let userId     = context.principals[0][securityId];
    let controller = context.invocationContext.target;
    if ((controller as any).__sphereItem !== true) {
      console.error("Tried to set sphere authorization on a controller that is not extending SphereItem.");
      return AuthorizationDecision.DENY;
    }

    let modelName = (controller as any).modelName;
    if (modelName === undefined) {
      console.error("Model name is required for SphereItems");
      return AuthorizationDecision.DENY;
    }
    let itemId = context.invocationContext.args[0];
    let accessLevel = await getAccessLevel(userId, itemId, modelName);
    if (accessLevel === null) {
      return AuthorizationDecision.DENY;
    }

    let allowedAccessLevels = metadata.allowedRoles;
    if (allowedAccessLevels.indexOf(accessLevel) === -1) {
      return AuthorizationDecision.DENY;
    }

    return AuthorizationDecision.ALLOW;
  }
}

async function getAccessLevel(userId: string, itemId: string, modelName: string) : Promise<string | null> {
  let item : any = null;
  try {
    switch (modelName) {
      case "Stone":
        item = await Dbs.stone.findById(itemId, {fields: {sphereId: true}});
        break;
      case "Sphere":
        item = {sphereId: itemId};
        break;
      default:
        return null;
    }

    if (item && item?.sphereId) {
      let sphereId = item.sphereId;
      let accessLevel = await Dbs.sphereAccess.find({
        where: {and: [{userId}, {sphereId}, {invitePending: false}]},
        fields: {role: true}, limit:1
      })
      if (accessLevel.length === 0) {
        return null
      }
      return accessLevel[0].role || null;
    }
    return null;
  }
  catch (err) {
    return null;
  }
}

