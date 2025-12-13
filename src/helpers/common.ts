import { PayloadType } from "../types/operation";

export class CommonHelpers {
  static getOperationType(operation) {
    if (operation.action === PayloadType.SEND) {
      return PayloadType.SEND;
    }
    return PayloadType.RECEIVE;
  }
}
