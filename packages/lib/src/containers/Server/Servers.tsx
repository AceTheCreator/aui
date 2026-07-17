import Section from "../../components/Section";
import { Server as ServerInterface } from "../../types/asyncapi/Server";
import VerticalNavigation from "../../components/VerticalNavigation";
import { useState } from "react";
import Server from "./Server";
import { SERVER_TEXT } from "../../contants";

interface ServersProps {
  servers: Record<string, ServerInterface>;
  selectedServer?: string | null;
  onSelectServer?: (serverName: string) => void;
}

export default function Servers({ servers, selectedServer, onSelectServer }: ServersProps) {
  const serverNames = Object.keys(servers);
  const [selected, setSelected] = useState<string | undefined>(undefined);
  // Prefers the caller-controlled selection (e.g. from search); falls back to
  // uncontrolled local state, then to the first server if neither is set yet or
  // the previously selected one no longer exists (e.g. after switching documents).
  const current = [selectedServer, selected].find(
    (name): name is string => !!name && serverNames.includes(name),
  ) ?? serverNames[0];

  const setCurrent = (serverName: string) => {
    setSelected(serverName);
    onSelectServer?.(serverName);
  };

  // An explicit pick (nav click or search) means the user asked to see this
  // server's full detail, so its Authorization accordion shouldn't stay
  // collapsed — same reasoning as MessageRow auto-expanding on `isSelected`.
  const content = <Server {...servers[current]} autoExpandAuth={!!(selectedServer || selected)} />;
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
        reverseLayoutOnMobile={true}
      />
    </div>
  );
}
