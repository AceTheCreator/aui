import { useEffect, useMemo, useState } from "react";
import Tabs from "./Tabs";
import { UserPassword } from "../types/asyncapi/UserPassword";
import { ApiKey as ApiKeyType } from "../types/asyncapi/ApiKey";
import { X509 } from "../types/asyncapi/X509";
import { SymmetricEncryption } from "../types/asyncapi/SymmetricEncryption";
import { AsymmetricEncryption } from "../types/asyncapi/AsymmetricEncryption";
import { BearerHttpSecurityScheme } from "../types/asyncapi/BearerHttpSecurityScheme";
import { ApiKeyHttpSecurityScheme } from "../types/asyncapi/ApiKeyHttpSecurityScheme";
import { Oauth2Flows } from "../types/asyncapi/Oauth2Flows";
import { OpenIdConnect } from "../types/asyncapi/OpenIdConnect";
import { SaslPlainSecurityScheme } from "../types/asyncapi/SaslPlainSecurityScheme";
import { SaslScramSecurityScheme } from "../types/asyncapi/SaslScramSecurityScheme";
import { SaslGssapiSecurityScheme } from "../types/asyncapi/SaslGssapiSecurityScheme";
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
import { useAsyncAPIDocument } from "../contexts";
import { resolveRefs } from "../utils/hasRef";

type SecurityScheme =
  | UserPassword
  | ApiKeyType
  | X509
  | SymmetricEncryption
  | AsymmetricEncryption
  | BearerHttpSecurityScheme
  | ApiKeyHttpSecurityScheme
  | Oauth2Flows
  | OpenIdConnect
  | SaslPlainSecurityScheme
  | SaslScramSecurityScheme
  | SaslGssapiSecurityScheme;

const tabs = [
  { id: "userPassword", name: "User/Password" },
  { id: "oauth2", name: "OAuth2" },
  { id: "apiKey", name: "API key" },
  { id: "openIdConnect", name: "OpenID" },
  { id: "X509", name: "X.509 certificate" },
  { id: "scramSha256", name: "SASL" },
  { id: "scramSha512", name: "SASL" },
];

interface Props {
  securities: SecurityScheme[];
}

export default function Authorization({ securities }: Props) {
  const { deref } = useAsyncAPIDocument();
  resolveRefs(securities, deref);
  const filteredTabs = useMemo(() => {
    return tabs.filter((tab) => {
      const tabId = tab.id;
      return securities?.some(
        (security: SecurityScheme) =>
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

  function filteredType<T extends SecurityScheme>(type: string): T {
    return securities.find((security) => security.type === type) as T;
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
        {authTab && ["scramSha256", "scramSha512"].includes(authTab) && (
          <span>
            You have to <strong>provide username and password</strong> to
            connect to this server.
          </span>
        )}
        {authTab === "X509" && (
          <span>
            You have to <strong>download the certificate file</strong> from the
            service provider to connect to this server.
          </span>
        )}
        {authTab === "apiKey" && <ApiKey security={filteredType<ApiKeyType>("apiKey")} />}
        {authTab === "openIdConnect" && (
          <OpenID security={filteredType<OpenIdConnect>("openIdConnect")} />
        )}
        {authTab === "oauth2" && <OAuth2 security={filteredType<Oauth2Flows>("oauth2")} />}
      </div>
    </div>
  );
}

export const ApiKey = ({ security }: { security: ApiKeyType }) => {
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

export const OpenID = ({ security }: { security: OpenIdConnect }) => {
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

export const OAuth2 = ({ security }: { security: Oauth2Flows }) => {
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
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                    <dt className="text-sm font-medium text-gray-500">
                      Token URL
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a href={``}>{flowData.tokenUrl}</a>
                    </dd>
                  </div>
                  {flowData.refreshUrl && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                      <dt className="text-sm font-medium text-gray-500">
                        Refresh URL
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <a href={``}>{flowData.refreshUrl}</a>
                      </dd>
                    </div>
                  )}
                  {flowData.availableScopes && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                      <dt className="text-sm font-medium text-gray-500">
                        Scopes
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(flowData.availableScopes)
                            ? flowData.availableScopes
                            : Object.keys(flowData.availableScopes)
                          ).map((scope: string) => (
                            <code key={scope} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                              {scope}
                            </code>
                          ))}
                        </div>
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
