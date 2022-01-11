import {Binding, Component} from "@loopback/core";
import {AuthorizationTags} from "@loopback/authorization";
import {MyAuthorizationProvider} from "./authorization-sphere";

export class SphereAuthorizationComponent implements Component {
  bindings: Binding[] = [
    Binding.bind('authorizationProviders.sphere')
      .toProvider(MyAuthorizationProvider)
      .tag(AuthorizationTags.AUTHORIZER),
  ];
}