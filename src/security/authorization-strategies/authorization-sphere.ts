import {Provider} from "@loopback/context";
import {
  AuthorizationContext,
  AuthorizationDecision,
  AuthorizationMetadata,
  Authorizer
} from "@loopback/authorization";
import {Dbs} from "../../modules/containers/RepoContainer";
import {securityId} from "@loopback/security";
import {AccessLevels} from "../../models/sphere-access.model";

type AuthorizationModel = "Sphere" | "Stone" | "Message";

export const Authorization = {
  sphereAccess: (authorizationModel?: AuthorizationModel, config?: {scopes?: string[]}) => {
    return {
      scopes: config?.scopes ?? [],
      authorizationModel: authorizationModel,
      allowedRoles: [
        AccessLevels.admin,
        AccessLevels.member,
        AccessLevels.guest,
        AccessLevels.basic,
        AccessLevels.hub,
      ]
    }},
  sphereMember: (authorizationModel?: AuthorizationModel, config?: {scopes?: string[]}) => {
    return {
      scopes: config?.scopes ?? [],
      authorizationModel: authorizationModel,
      allowedRoles: [
        AccessLevels.admin,
        AccessLevels.member,
        AccessLevels.hub,
      ]
    }},
  sphereAdmin:  (authorizationModel?: AuthorizationModel, config?: {scopes?: string[]}) => {
    return {
      scopes: config?.scopes ?? [],
      authorizationModel: authorizationModel,
      allowedRoles: [
        AccessLevels.admin,
      ]
    }},
  sphereAdminHub: (authorizationModel?: AuthorizationModel, config?: {scopes?: string[]}) => {
    return {
      scopes: config?.scopes ?? [],
      authorizationModel: authorizationModel,
      allowedRoles: [
        AccessLevels.admin,
        AccessLevels.hub,
      ]
    }},
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

    let authorizationModelName      = (controller as any).authorizationModelName;
    let authorizationOverrideName   = (metadata as any).authorizationModel  ?? null;
    let effectiveAuthorizationName  = authorizationOverrideName ?? authorizationModelName;

    if (effectiveAuthorizationName === undefined) {
      console.error("Model name is required for SphereItems");
      return AuthorizationDecision.DENY;
    }

    let itemId = context.invocationContext.args[0];
    let accessLevel = await getAccessLevel(userId, itemId, effectiveAuthorizationName);
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

async function getAccessLevel(userId: string, itemId: string, authorizationModelName: AuthorizationModel) : Promise<string | null> {
  let item : any = null;
  try {
    switch (authorizationModelName) {
      case "Message":
        item = await Dbs.messageV2.findById(itemId, {fields: {sphereId: true}});
        break;
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

