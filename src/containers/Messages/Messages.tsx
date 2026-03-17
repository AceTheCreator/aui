import Section from "../../components/Section";

interface MessageDefinition {
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  contentType?: string;
  payload?: Record<string, unknown> & {
    type?: string;
  };
}

interface MessagesProps {
  messages: Record<string, MessageDefinition>;
}

export default function Messages({ messages }: MessagesProps) {
  const messageEntries = Object.entries(messages);

  const content = messageEntries.length ? (
    <div className="mt-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 w-full">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Message
            </th>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Summary
            </th>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Details
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {messageEntries.map(([messageKey, message]) => {
            const heading = message.title ?? message.name ?? messageKey;
            const summary =
              message.summary ??
              message.description ??
              "No summary available for this message.";
            const payloadType = message.payload?.type?.toUpperCase() ?? "SCHEMA";

            return (
              <tr key={messageKey}>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {heading}
                    </span>
                    <code className="w-fit rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                      {messageKey}
                    </code>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{summary}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start gap-2 text-sm text-gray-600">
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {message.contentType ?? "Content type not specified"}
                    </span>
                    <span>Payload: {payloadType}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="mt-10 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
      No messages defined in this AsyncAPI document.
    </div>
  );

  return (
    <div className="container">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
