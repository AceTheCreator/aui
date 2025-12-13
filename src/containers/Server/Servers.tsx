import Section from "../../components/Section";
import { ServerInterface } from "../../types/server";
import VerticalNavigation from "../../components/VerticalNavigation";
import { useState } from "react";
import Server from "./Server";
import { SERVER_TEXT } from "../../contants";

interface ServersInterface {
  [key: string]: Record<string, ServerInterface>;
}

export default function Servers({ servers }: ServersInterface) {
  const serverNames = [...Object.keys(servers)];
  const [current, setCurrent] = useState(serverNames[0]);
  const content = <Server {...servers[current]} />;
  return (
    <div className="flex justify-center w-full">
      <Section
        title={SERVER_TEXT}
        content={content}
        sideContent={
          <VerticalNavigation
            serverNames={serverNames}
            current={current}
            setCurrent={setCurrent}
          />
        }
        stickySideContent={true}
      />
    </div>
  );
}
