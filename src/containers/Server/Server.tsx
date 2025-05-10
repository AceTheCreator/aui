import Markdown from "../../components/Markdown";
import formatEnumDescription from "../../helpers/formatEnumDescription";
import IconLink from "../../icons/Link";
import IconShieldCheck from "../../icons/ShieldCheck";
import IconVariable from "../../icons/Variable";
import { ServerInterface } from "../../types/server";
import Authorization from "../../components/Authorization";
import Tag from "../../components/Tag";
import Connection from "../../icons/Connection";
import Bindings from "../../components/Bindings";

export default function Server({
  host,
  protocol,
  description,
  protocolVersion,
  tags,
  variables,
  security,
  bindings,
}: ServerInterface) {
  console.log(bindings);
  const chunkColors = [
    "text-blue-600",
    "text-indigo-600",
    "text-purple-600",
    "text-pink-600",
    "text-green-700",
  ];
  let colorIndex = 0;
  const urlChunks = (host.match(/({[\w\d\s\-_]+})|([^{]+)/gi) || []).map(
    (chunk, index): JSX.Element => {
      const isVariable = chunk.startsWith("{");
      const variableName = isVariable ? chunk.slice(1, -1) : "";
      return (
        <span
          key={index}
          className={
            isVariable ? chunkColors[colorIndex++ % chunkColors.length] : ""
          }
          title={
            isVariable
              ? variables?.[variableName]?.description || undefined
              : undefined
          }
        >
          {chunk}
        </span>
      );
    }
  );
  const variableElems = (
    <>
      {Object.keys(variables).map((variable, i) => {
        const variableProps = variables[variable];
        return (
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">
              <code
                className={`${chunkColors[i % chunkColors.length]} font-bold`}
              >{`{${variable}}`}</code>
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 prose">
              {variableProps.description}{" "}
              {variableProps.enum && formatEnumDescription(variableProps.enum)}
              <div className="mt-2">
                <span className="font-bold text-gray-500 mt-4 mr-2">
                  Default value:
                </span>
                <code>{variableProps.default}</code>
              </div>
              {variableProps.examples && (
                <div className="mt-2">
                  <span className="font-bold text-gray-500 mt-4 mr-2">
                    Examples:
                  </span>
                  {variableProps.examples.map((example) => {
                    return <code>{example}</code>;
                  })}
                </div>
              )}
            </dd>
          </div>
        );
      })}
    </>
  );
  return (
    <div>
      <div className="font-bold text-gray-700 mt-8 mb-4 bg-gray-200 border border-gray-500 p-4 rounded-lg">
        <div className="border border-dotted border-black p-2 rounded-lg bg-white">
          <IconLink className="inline-block mr-2 -mt-1 h-6 text-gray-500" />
          {urlChunks}
        </div>
        <div className="mt-2">
          {tags &&
            tags.map((tag, index) => (
              <Tag
                key={index}
                href={tag.externalDocs && tag.externalDocs.url}
                title={
                  tag.description ||
                  (tag.externalDocs && tag.externalDocs.description
                    ? tag.externalDocs.description
                    : null)
                }
                name={tag.name}
              />
            ))}
        </div>
      </div>
      <Markdown>{description}</Markdown>
      <h3 className="font-bold text-gray-700 mt-8">
        <IconVariable className="inline-block mr-2 -mt-1 h-6 text-gray-500" />
        URL Variables
      </h3>
      <div className="mt-5 border-t border-gray-200">
        <dl className="sm:divide-y sm:divide-gray-200">{variableElems}</dl>
      </div>
      {security && security.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-700 mt-8">
            <IconShieldCheck className="inline-block mr-2 -mt-1 h-6 text-gray-500" />
            Authorization
          </h3>
          <p className="prose text-gray-500 mt-4">
            This server accepts the following authorization mechanisms:
          </p>
          <Authorization securities={security} />
        </div>
      )}
      {bindings && (
        <div>
          <h3 className="font-bold text-gray-700 mt-8">
            <Connection className="inline-block mr-2 -mt-1 h-6 text-gray-500" />
            Connection Settings
          </h3>
          {/* <p className="prose text-gray-500 mt-4">
            This server accepts the following connection configuration:
          </p> */}
          <Bindings
            expand={true}
            type="server"
            bindings={bindings[protocol]}
            protocol={protocol}
          />
        </div>
      )}
    </div>
  );
}
