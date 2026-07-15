import { useState } from "react";
import { MessageDetails } from "./MessageDetails";
import { MessageObject } from "../../types/asyncapi/MessageObject";
import { CorrelationId } from "../../types/asyncapi/CorrelationId";

interface MessageProps {
  message: MessageObject;
  messageId?: string;
  i: number;
}

export function Message({ message, messageId, i }: MessageProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-foreground">
            {message.title ?? message.name ?? `Message ${i + 1}`}
          </p>
          {(messageId ?? message.name) && (
            <span className="text-xs font-mono bg-primary-50 text-primary-600 border border-primary-200 p-0.5 rounded shrink-0">
              {messageId ?? message.name}
            </span>
          )}
        </div>
        {message.summary && (
          <p className="text-xs text-foreground-muted mt-1.5 leading-relaxed">
            {message.summary}
          </p>
        )}

        <div className="flex items-center gap-1.5 shrink-0 mt-4">
          {message.contentType && (
            <span className="text-xs font-mono bg-neutral-100 text-foreground-muted px-1.5 py-0.5 rounded">
              {message.contentType}
            </span>
          )}
          {message.correlationId && (
            <span
              className="text-xs bg-secondary-50 text-secondary-500 px-1.5 py-0.5 rounded border border-secondary-200"
              title={
                (message.correlationId as CorrelationId).description ??
                (message.correlationId as CorrelationId).location
              }
            >
              {(message.correlationId as CorrelationId).location}
            </span>
          )}
          {message.deprecated && (
            <span className="text-xs bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-200">
              deprecated
            </span>
          )}
        </div>
      </div>

      <MessageDetails
        message={message}
        expanded={expanded}
        onToggleExpanded={() => setExpanded((v) => !v)}
      />
    </div>
  );
}
