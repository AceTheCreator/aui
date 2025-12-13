import Section from "../../components/Section";
import { Operation_TEXT } from "../../contants";
import { useAsyncAPIDocument } from "../../contexts";
import IconTag from "../../icons/Tag";
import { resolveRefs } from "../../utils/hasRef";
import Operation from "./Operation";

export default function Operations({ operations }) {
  const { deref } = useAsyncAPIDocument();
  if (!Object.keys(operations).length) {
    return null;
  }

  const operationList: React.ReactNode[] = Object.keys(operations).map(
    (operation) => {
      const op = operations[operation];
      resolveRefs(op, deref);
      const address = op.channel?.address;
      console.log(address);
      return (
        <tr>
          <td className="px-6 py-4">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {/* {operation.id} */}
                id
              </div>
              <div className="text-sm text-gray-500">{op.summary}</div>
            </div>
          </td>
          <td className="px-6 py-4 w-20">
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium`}
            >
              {/* <Icon size={12} /> */}
              {/* {operation.type} */}
              {op.action}
            </div>
          </td>
          <td className="px-6 py-4">
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              {/* {operation.channel} */}
              {address}
            </code>
          </td>
        </tr>
      );
    }
  );

  const content = (
    <div className="mt-10 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 w-full">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Operation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Channel/Topic
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
