import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Operation as OperationInterface } from "../../types/asyncapi/Operation";
import { OperationAction } from "../../types/asyncapi/OperationAction";
import { Tag } from "../../types/asyncapi/Tag";
import { Message } from "../Messages/Message";

interface OperationProps {
  op: OperationInterface;
  id: string | null;
}

export default function Operation({ op, id }: OperationProps) {
  const messages = (op.messages ?? []) as unknown as MessageObject[];
  console.log(messages)
  const tags = (op.tags ?? []) as unknown as Tag[];

  const isSend = op.action === OperationAction.SEND;
  const badgeClassName = isSend
    ? "bg-green-100 text-green-800"
    : op.action === OperationAction.RECEIVE
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="space-y-6">
      {op.title && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{op.title}</h2>
        </div>
      )}
      {op.summary && (
        <div>
          <p className="text-sm text-gray-600">{op.summary}</p>
        </div>
      )}
      <div
        className={`flex justify-between w-[400px]`}
      >
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Operation Method
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium uppercase ${badgeClassName}`}
          >
            {op.action}
          </span>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Operation ID
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-600 text-white`}
          >
            {id}
          </span>
        </div>
      </div>

      {/* Title */}
      {op.title && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Title
          </p>
          <p className="text-sm text-gray-800">{op.title}</p>
        </div>
      )}

      {/* Description */}
      {op.description && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            Description
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {op.description}
          </p>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            {messages.length > 1 ? "messages" : "message"}
          </p>
          <div className="space-y-2">
            {messages.map((msg, i) => (
              <Message message={msg} i={i} />
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
