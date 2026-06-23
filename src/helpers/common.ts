import { OperationAction } from "../types/asyncapi/OperationAction";
import { Operation } from "../types/asyncapi/Operation";

export function isUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export class CommonHelpers {
  static getOperationType(operation: Operation) {
    if (operation.action === OperationAction.SEND) {
      return OperationAction.SEND;
    }
    return OperationAction.RECEIVE;
  }
}
