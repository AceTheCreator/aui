import Section from "../../components/Section";
import { Server as ServerInterface } from "../../types/asyncapi/Server";
import VerticalNavigation from "../../components/VerticalNavigation";
import { useState } from "react";
import Server from "./Server";
import { SERVER_TEXT } from "../../contants";

interface ServersInterface {
  [key: string]: Record<string, ServerInterface>;
}

export default function Servers({ servers }: ServersInterface) {
  const serverNames = [...Object.keys(servers)];
  const [selected, setSelected] = useState<string | undefined>(undefined);
  // Falls back to the first server whenever there's no explicit selection yet, or the
  // previously selected one no longer exists (e.g. after switching to a different document).
  const current = selected && serverNames.includes(selected) ? selected : serverNames[0];
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
            setCurrent={setSelected}
          />
        }
        stickySideContent={true}
        reverseLayoutOnMobile={true}
      />
    </div>
  );
}
