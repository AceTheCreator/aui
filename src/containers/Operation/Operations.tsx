import { useState } from "react";
import { ChannelAddress } from "../../components/ChannelAddress";
import Section from "../../components/Section";
import { SidePanel } from "../../components/SidePanel";
import { Operation_TEXT } from "../../contants";
import { useAsyncAPIDocument } from "../../contexts";
import { Channel } from "../../types/asyncapi/Channel";
import { Parameter } from "../../types/asyncapi/Parameter";
import { Operation as OperationType } from "../../types/asyncapi/Operation";
import { OperationAction } from "../../types/asyncapi/OperationAction";
import { resolveRefs } from "../../utils/hasRef";
import Operation from "./Operation";

interface OperationsProps {
  operations: Record<string, OperationType>;
}

export default function Operations({ operations }: OperationsProps) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  console.log(selectedKey)
  const { deref } = useAsyncAPIDocument();

  if (!Object.keys(operations).length) {
    return null;
  }

  const selectedOp = selectedKey ? operations[selectedKey] : null;

  const operationList: React.ReactNode[] = Object.keys(operations).map((key) => {
    const op = operations[key];
    resolveRefs(op, deref);
    const channel = op.channel as unknown as Channel;
    const address = channel?.address;
    const parameters = channel?.parameters as unknown as Record<string, Parameter> | undefined;
    const isSend = op.action === OperationAction.SEND;
    const actionLabel = op.action?.toUpperCase() ?? "";
    const badgeClassName = isSend
      ? "bg-green-100 text-green-800"
      : op.action === OperationAction.RECEIVE
        ? "bg-blue-100 text-blue-800"
        : "bg-gray-100 text-gray-700";
    const isSelected = selectedKey === key;

    return (
      <tr
        key={key}
        onClick={() => setSelectedKey(key)}
        className={`group cursor-pointer ${isSelected ? "bg-gray-50" : ""}`}
      >
        <td className="px-6 py-4 group-hover:bg-gray-50">
          {address && <ChannelAddress address={address} parameters={parameters} />}
        </td>
        <td className="px-6 py-4 w-32 group-hover:bg-gray-50">
          <div
            className={`inline-flex w-24 items-center justify-center px-2 py-1 text-center rounded-md text-xs font-medium uppercase ${badgeClassName}`}
          >
            {actionLabel}
          </div>
        </td>
        <td className="group-hover:bg-gray-50" />
      </tr>
    );
  });

  const selectedChannel = selectedOp ? (selectedOp.channel as unknown as Channel) : null;
  const panelTitle = selectedOp && selectedChannel?.address ? (
    <ChannelAddress
      address={selectedChannel.address}
      parameters={selectedChannel.parameters as unknown as Record<string, Parameter>}
    />
  ) : (selectedKey ?? "Operation");

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {operationList}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="flex justify-center w-full">
        <Section
          title={Operation_TEXT}
          content={content}
          stickySideContent={false}
        />
      </div>

      <SidePanel
        isOpen={!!selectedOp}
        side="right"
        onClose={() => setSelectedKey(null)}
        title={panelTitle}
      >
        {selectedOp && <Operation op={selectedOp} id={selectedKey} />}
      </SidePanel>
    </>
  );
}
