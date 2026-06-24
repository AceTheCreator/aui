import { useState } from "react";
import { MessageObject } from "../types/asyncapi/MessageObject";
import { Channel } from "../types/asyncapi/Channel";
import { OperationReply } from "../types/asyncapi/OperationReply";
import { OperationReplyAddress } from "../types/asyncapi/OperationReplyAddress";
import { Parameter } from "../types/asyncapi/Parameter";
import { Message } from "../containers/Messages/Message";
import { ChannelAddress } from "./ChannelAddress";

interface IReplyProps {
    requestMessages: MessageObject[];
    reply: OperationReply;
    isSend: boolean;
    operationId: string | null;
}

export function Reply({ requestMessages, reply, isSend, operationId }: IReplyProps) {
    const [tab, setTab] = useState<"request" | "reply">("request");

    const replyMessages = (reply.messages ?? []) as unknown as MessageObject[];
    const replyChannel = reply.channel as unknown as Channel
    const replyAddress = reply.address as unknown as OperationReplyAddress;

    const activeMessages = tab === "request" ? requestMessages : replyMessages;
    const verb =
      tab === "request" ? (
        isSend ? (
          "accepts"
        ) : (
          "expects"
        )
      ) : (
        <>
          replies to{" "}
          {replyAddress ? (
            <>
              to a channel in{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-white border border-neutral-200 text-neutral-600">
                {replyAddress.location}
              </span>
            </>
          ) : replyChannel?.address && (
            <ChannelAddress
              address={replyChannel.address}
              parameters={replyChannel.parameters as unknown as Record<string, Parameter>}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-white border border-neutral-200 text-neutral-600"
            />
          ) }
        </>
      );

    return (
      <div>
        {/* Tabs */}
        <div className="flex items-end gap-0.5 -ml-2">
          {(["request", "reply"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-sm font-medium rounded-t-md transition-colors capitalize
                            ${
                              tab === t
                                ? "bg-neutral-100 text-neutral-800 border border-b-0 border-neutral-200"
                                : "text-neutral-400 hover:text-neutral-600"
                            }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="-mx-5 px-5 py-4 bg-neutral-100 border-t border-neutral-200 min-h-32">
          {activeMessages.length > 0 ? (
            <>
              <p className="text-sm text-neutral-600 mb-3">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold bg-white border border-neutral-200 text-neutral-600">
                  {operationId}
                </span>{" "}
                {verb}
                {activeMessages.length > 1 ? (
                  <>
                    <span className="inline-flex items-center px-1.5 py-0.5 font-bold text-neutral-600">
                      one of
                    </span>
                    the following messages:
                  </>
                ) : (
                  <span>{" "} with the following message:</span>
                )}
              </p>
              <div className="space-y-2">
                {activeMessages.map((msg, i) => (
                  <Message key={i} message={msg} messageId={msg.name} i={i} />
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-neutral-400 italic">No messages defined.</p>
          )}
        </div>
      </div>
    );
}
