import { OperationBindingsObject } from "../../types/asyncapi/OperationBindingsObject";
import Authorization from "../../components/Authorization";
import Bindings from "../../components/Bindings";
import { isUrl } from "../../helpers/common";
import { ExternalDocs } from "../../types/asyncapi/ExternalDocs";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { Operation as OperationInterface } from "../../types/asyncapi/Operation";
import { OperationAction } from "../../types/asyncapi/OperationAction";
import { OperationReply } from "../../types/asyncapi/OperationReply";
import { Tag } from "../../types/asyncapi/Tag";
import { Message } from "../Messages/Message";
import { Reply } from "../../components/Reply";

interface OperationProps {
  op: OperationInterface;
  id: string | null;
}

export default function Operation({ op, id }: OperationProps) {
  const messages = (op.messages ?? []) as unknown as MessageObject[];
  const tags = (op.tags ?? []) as unknown as Tag[];
  const bindings = op.bindings as unknown as OperationBindingsObject | undefined;
  const traits = op.traits as unknown as Array<Record<string, unknown>> | undefined;
  const reply = op.reply as unknown as OperationReply | undefined;
  const externalDocs = op.externalDocs as unknown as ExternalDocs | undefined;
  const security = op.security as unknown as unknown[] | undefined;

  const operationBindings: OperationBindingsObject | undefined =
    bindings ??
    (Array.isArray(traits)
      ? (traits.find((t) => t.bindings)?.bindings as OperationBindingsObject | undefined)
      : undefined);

  const isSend = op.action === OperationAction.SEND;
  const badgeClassName = isSend
    ? "bg-green-100 text-green-800"
    : op.action === OperationAction.RECEIVE
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-700";
  
  const messageList = (
    <div className="space-y-2">
      {messages.map((msg, i) => (
        <Message key={i} message={msg} messageId={msg.name} i={i} />
      ))}
    </div>
  );

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
      <div className={`flex justify-between w-[400px]`}>
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
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-orange-50 text-orange-600 border border-orange-200`}
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

      {/* External Docs */}
      {externalDocs?.url && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            External Documentation
          </p>
          {isUrl(externalDocs.url) ? (
            <a
              href={externalDocs.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline underline-offset-2 hover:text-blue-800 break-all"
            >
              {externalDocs.url}
            </a>
          ) : (
            <p className="text-sm text-gray-600">{externalDocs.url}</p>
          )}
        </div>
      )}

      {/* Security */}
      {security && security.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            Authorization Mechanisms
          </p>
          <Authorization
            securities={
              security as Parameters<typeof Authorization>[0]["securities"]
            }
          />
        </div>
      )}

      {/* Bindings */}
      {operationBindings &&
        Object.entries(operationBindings).map(([protocol, binding]) =>
          binding ? (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                Operation configuration
              </p>
              <Bindings
                key={protocol}
                protocol={protocol}
                bindings={binding as Record<string, unknown>}
              />
            </div>
          ) : null,
        )}

      {/* Messages */}
      {reply ? (
        <Reply requestMessages={messages} reply={reply} isSend={isSend} operationId={id} />
      ) : (
        messages.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
              <span className="text-black font-bold">{id}</span>{" "}
              {isSend ? "accepts" : "expects"}
              {messages.length > 1 ? (
                <>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold text-black">
                    one of
                  </span>
                  the following messages:
                </>
              ) : (
                "the following message:"
              )}
            </p>
            {messageList}
          </div>
        )
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
