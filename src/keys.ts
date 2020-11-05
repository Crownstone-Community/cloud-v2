/**
 * This is used to get the name of an invoked endpoint in authorization.
 */

import {BindingKey} from '@loopback/core';

export const RESOURCE_ID = BindingKey.create<string>('resourceId');