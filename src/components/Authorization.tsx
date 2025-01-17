import { useState } from "react";
import Tabs from "./Tabs";

  const tabs = [
    { id: "user-password", name: "User/Password" },
    { id: "oauth2", name: "OAuth2" },
    { id: "api-key", name: "API key" },
    { id: "openid", name: "OpenID" },
  ];

export default function Authorization(){
    const [authTab, setAuthTab] = useState("oauth2");
    return (
      <div>
        <Tabs tabs={tabs} current={authTab} onChange={setAuthTab} />
        <div className="py-4 prose text-gray-500">
          {authTab === "user-password" && (
            <span>
              You have to <strong>provide user and password</strong> to connect
              to this server.
            </span>
          )}
          {authTab === "api-key" && (
            <span>
              You have to{" "}
              <strong>
                provide your API key as the user name and leave the password
                empty
              </strong>{" "}
              to connect to this server.
            </span>
          )}
          {authTab === "openid" && (
            <>
              <p>You can use OpenID to connect to this server.</p>
              <p>
                The OpenID Connect URL is{" "}
                <a href="https://authserver.example/.well-known">
                  https://authserver.example/.well-known
                </a>
                .
              </p>
            </>
          )}
          {authTab === "oauth2" && (
            <>
              <div>
                <h4 className="text-lg leading-6 font-bold text-gray-900">
                  Implicit
                </h4>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  The Implicit flow is a simplified OAuth flow previously
                  recommended for native apps and JavaScript apps where the
                  access token is returned immediately without an extra
                  authorization code exchange step.
                </p>
              </div>
              <div className="mt-5 border-t border-gray-200">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Authorization URL
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <a href="https://authserver.example/auth">
                        https://authserver.example/auth
                      </a>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-500">
                      Scopes
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <code>streetlights:on</code>,{" "}
                      <code>streetlights:off</code>
                    </dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </div>
      </div>
    );
}