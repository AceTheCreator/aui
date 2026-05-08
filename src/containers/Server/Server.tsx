import Markdown from "../../components/Markdown";
import formatEnumDescription from "../../helpers/formatEnumDescription";
import IconLink from "../../icons/Link";
import IconShieldCheck from "../../icons/ShieldCheck";
import IconVariable from "../../icons/Variable";
import { chunkURL } from "../../helpers/chunkURL";
import { Server as ServerInterface } from "../../types/asyncapi/Server";
import { ServerVariable } from "../../types/asyncapi/ServerVariable";
import { Tag as TagType } from "../../types/asyncapi/Tag";
import { ExternalDocs } from "../../types/asyncapi/ExternalDocs";
import { ServerBindingsObject } from "../../types/asyncapi/ServerBindingsObject";
import Authorization from "../../components/Authorization";
import Tag from "../../components/Tag";
import Connection from "../../icons/Connection";
import Bindings from "../../components/Bindings";
import { chunkColors } from "../../contants";

export default function Server({
  host,
  protocol,
  description,
  tags,
  variables,
  security,
  bindings,
}: ServerInterface) {

  const urlChunks = chunkURL(host, variables);

  const variableElems = (
    <>
      {variables &&
        Array.from(variables.keys()).map((variable, i) => {
          const variableProps = variables.get(variable) as ServerVariable;
          return (
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">
                <code
                  className={`${chunkColors[i % chunkColors.length]} font-bold`}
                >{`{${variable}}`}</code>
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 prose">
                {variableProps.description}{" "}
                {variableProps.enum &&
                  formatEnumDescription(variableProps.enum)}
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
            tags.map((tag, index) => {
              const t = tag as TagType;
              const extDocs = t.externalDocs as ExternalDocs | undefined;
              return (
                <Tag
                  key={index}
                  href={extDocs && extDocs.url}
                  title={
                    t.description ||
                    (extDocs && extDocs.description ? extDocs.description : undefined)
                  }
                  name={t.name}
                />
              );
            })
          }
        </div>
      </div>
      <Markdown>{description}</Markdown>
      {variables && (
        <>
          <h3 className="font-bold text-gray-700 mt-8">
            <IconVariable className="inline-block mr-2 -mt-1 h-6 text-gray-500" />
            URL Variables
          </h3>
          <div className="mt-5 border-t border-gray-200">
            <dl className="sm:divide-y sm:divide-gray-200">{variableElems}</dl>
          </div>
        </>
      )}
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
          <Bindings
            expand={false}
            bindings={(bindings as ServerBindingsObject)[protocol as keyof ServerBindingsObject]}
            protocol={protocol}
          />
        </div>
      )}
    </div>
  );
}
