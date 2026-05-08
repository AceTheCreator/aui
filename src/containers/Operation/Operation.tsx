import { Operation as OperationInterface } from "../../types/asyncapi/Operation";

export default function Operation(prop: OperationInterface) {
  const { action, summary, channel, messages, parameters, traits } = prop;

  console.log(channel);
  return <div className="mt-6 p-4 border rounded-md min-h-16"></div>;
}
