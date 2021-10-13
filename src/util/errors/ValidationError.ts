import {Entity} from "@loopback/repository";


export const ValidationErrorCode = 'VALIDATION_FAILED';
export class ValidationError extends Error {

  alternative : Entity = null;

  constructor(alternative? : Entity) {
    super(ValidationErrorCode);
    this.alternative = alternative;
  }
}