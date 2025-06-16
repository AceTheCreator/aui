import { useEffect, useMemo, useState } from "react";
import Tabs from "./Tabs";
import { SecurityInterface } from "../types/server";
import { formatArrayToCodeString } from "../helpers/formatEnumDescription";
import {
  AUTHORIZATION_CODE_DESCRIPTION,
  AUTHORIZATION_CODE_TEXT,
  CLIENT_CREDENTIALS_DESCRIPTION,
  CLIENT_CREDENTIALS_TEXT,
  IMPLICIT_DESCRIPTION,
  IMPLICIT_TEXT,
  PASSWORD_DESCRIPTION,
  PASSWORD_TEXT,
} from "../contants";

const tabs = [
  { id: "userPassword", name: "User/Password" },
  { id: "oauth2", name: "OAuth2" },
  { id: "apiKey", name: "API key" },
  { id: "openIdConnect", name: "OpenID" },
];

interface Props {
  securities: SecurityInterface[];
}

export default function Authorization({ securities }: Props) {
  const filteredTabs = useMemo(() => {
    return tabs.filter((tab) => {
      const tabId = tab.id;
      return securities?.some(
        (security: SecurityInterface) =>
          security.type.toLowerCase() === tabId.toLowerCase()
      );
    });
  }, [securities]);
  const [authTab, setAuthTab] = useState(
    filteredTabs.length > 0 ? filteredTabs[0].id : null
  );

  useEffect(() => {
    if (filteredTabs.length > 0) {
      setAuthTab(filteredTabs[0].id);
    }
  }, [securities]);

  function filteredType(type: string): SecurityInterface {
    return securities.find(
      (security: SecurityInterface) => security.type === type
    )!;
  }

  return (
    <div>
      <Tabs tabs={filteredTabs} current={authTab} onChange={setAuthTab} />
      <div className="py-4 prose text-gray-500">
        {authTab === "userPassword" && (
          <span>
            You have to <strong>provide user and password</strong> to connect to
            this server.
          </span>
        )}
        {authTab === "apiKey" && <ApiKey security={filteredType("apiKey")} />}
        {authTab === "openIdConnect" && (
          <OpenID security={filteredType("openIdConnect")} />
        )}
        {authTab === "oauth2" && <OAuth2 security={filteredType("oauth2")} />}
      </div>
    </div>
  );
}

interface ISecurity {
  security: SecurityInterface;
}

export const ApiKey = ({ security }: ISecurity) => {
  const keyLocation = security?.in;
  if (keyLocation === "password") {
    return (
      <span>
        You have to{" "}
        <strong>
          provide your API key as the password and leave the user name empty
        </strong>{" "}
        to connect to this server.
      </span>
    );
  }
  return (
    <span>
      You have to{" "}
      <strong>
        provide your API key as the user name and leave the password empty
      </strong>{" "}
      to connect to this server.
    </span>
  );
};

export const OpenID = ({ security }: ISecurity) => {
  return (
    <>
      <p>You can use OpenID to connect to this server.</p>
      <p>
        The OpenID Connect URL is{" "}
        <a href="https://authserver.example/.well-known">
          {security.openIdConnectUrl}
        </a>
        .
      </p>
      {security?.scopes && (
        <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 items-center sm:gap-4">
          <dt className="text-sm font-medium text-gray-500">Scopes</dt>
          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
            <code>{formatArrayToCodeString(security.scopes)}</code>
          </dd>
        </div>
      )}
    </>
  );
};

export const OAuth2 = ({ security }: ISecurity) => {
  const flows = security?.flows;
  return (
    <>
      {flows &&
        Object.entries(flows).map(([flow, flowData]) => {
          let title = "";
          let description = "";
          switch (flow) {
            case "clientCredentials":
              title = CLIENT_CREDENTIALS_TEXT;
              description = CLIENT_CREDENTIALS_DESCRIPTION;
              break;
            case "implicit":
              title = IMPLICIT_TEXT;
              description = IMPLICIT_DESCRIPTION;
              break;
            case "password":
              title = PASSWORD_TEXT;
              description = PASSWORD_DESCRIPTION;
              break;
            case "authorizationCode":
              title = AUTHORIZATION_CODE_TEXT;
              description = AUTHORIZATION_CODE_DESCRIPTION;
              break;
          }
          return (
            <div key={flow}>
              <div>
                <h4 className="text-lg leading-6 font-bold text-gray-900">
                  {title}
                </h4>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {description}
                </p>
              </div>
              <div className="mt-5 border-t border-gray-200">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                    <dt className="text-sm font-medium text-gray-500">
                      Authorization URL
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a href={``}>{flowData.authorizationUrl}</a>
                    </dd>
                  </div>
                  {security.scopes && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                      <dt className="text-sm font-medium text-gray-500">
                        Scopes
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <code>{formatArrayToCodeString(security.scopes)}</code>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          );
        })}
    </>
  );
};
