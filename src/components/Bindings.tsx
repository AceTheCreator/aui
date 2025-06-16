import { useState } from "react";
import IconArrowRight from "../icons/ArrowRight";
import IconDownRight from "../icons/ArrowDown";
import bindingSelector from "../helpers/bindingsSelector";
import SchemaRenderer from "./SchemaRenderer";

interface Props {
  bindings: any;
  expand: boolean;
  protocol: string;
}

export default function Bindings({ bindings, expand, protocol }: Props) {
  const schema = bindingSelector(protocol, null);
  const [expanded, setExpanded] = useState(expand);

  return (
    <div className="mt-2 rounded-lg bg-gray-200 border border-gray-500">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-sm font-medium text-gray-700">
          This server accepts the following connection configuration
        </span>
        {expanded ? (
          <IconDownRight className="w-[25px] text-gray-500" />
        ) : (
          <IconArrowRight className="w-[25px] text-gray-500" />
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-500 p-2">
          <SchemaRenderer data={bindings} schema={schema} />
        </div>
      )}
    </div>
  );
}
