import { OperationAction } from "../types/asyncapi/OperationAction";

export function isUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export class CommonHelpers {
  static getOperationType(operation) {
    if (operation.action === OperationAction.SEND) {
      return OperationAction.SEND;
    }
    return OperationAction.RECEIVE;
  }
}
