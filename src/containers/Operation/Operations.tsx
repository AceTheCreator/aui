import Section from "../../components/Section";
import { Operation_TEXT } from "../../contants";
import { useAsyncAPIDocument } from "../../contexts";
import { PayloadType } from "../../types/operation";
import { resolveRefs } from "../../utils/hasRef";

interface OperationsProps {
  operations: Record<
    string,
    {
      action?: string;
      channel?: {
        address?: string | null;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    }
  >;
}

export default function Operations({ operations }: OperationsProps) {
  const { deref } = useAsyncAPIDocument();
  if (!Object.keys(operations).length) {
    return null;
  }

  const operationList: React.ReactNode[] = Object.keys(operations).map(
    (operation) => {
      const op = operations[operation];
      resolveRefs(op, deref);
      const address = op.channel?.address;
      const isSend = op.action === PayloadType.SEND;
      const actionLabel = op.action?.toUpperCase() ?? "";
      const badgeClassName = isSend
        ? "bg-green-100 text-green-800"
        : op.action === PayloadType.RECEIVE
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-700";
      return (
        <tr key={operation}>
          <td className="px-6 py-4">
            <code className="text-xs px-2 py-1 rounded">{address}</code>
          </td>
          <td className="px-6 py-4 w-32">
            <div
              className={`inline-flex w-24 items-center justify-center px-2 py-1 text-center rounded-md text-xs font-medium uppercase ${badgeClassName}`}
            >
              {actionLabel}
            </div>
          </td>
        </tr>
      );
    }
  );

  const content = (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 w-full">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Operation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operationList}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="container">
      <Section
        title={Operation_TEXT}
        content={content}
        stickySideContent={false}
      />
    </div>
  );
}
