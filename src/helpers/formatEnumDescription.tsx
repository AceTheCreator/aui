import React from "react";

export default function formatEnumDescription(values: string[]): JSX.Element {
  if (values.length === 0) {
    return <span>No allowed values.</span>;
  }

  if (values.length === 1) {
    return (
      <span>
        Allowed value is <code>{values[0]}</code>
      </span>
    );
  }

  const allButLast = values.slice(0, -1).map((value, index) => (
    <React.Fragment key={index}>
      <code>{value}</code>,{" "}
    </React.Fragment>
  ));
  const last = <code key="last">{values[values.length - 1]}</code>;

  return (
    <span>
      Allowed values are {allButLast}and {last}
    </span>
  );
};

export function formatArrayToCodeString(arr: string[]): string {
  return arr.map((item) => `\`${item}\``).join(", ");
}