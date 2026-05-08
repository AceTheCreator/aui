import Section from "./Section";
import Tabs, { Tab } from "./Tabs";

export type ContentTabItem = Tab;

interface ContentTabProps {
  tabs: ContentTabItem[];
  current: string | null;
  onChange: (id: string) => void;
}

export default function ContentTab({
  tabs,
  current,
  onChange,
}: ContentTabProps) {
  if (!tabs.length) {
    return null;
  }

  const content = (
    <div className="w-full">
      <Tabs
        tabs={tabs}
        current={current}
        onChange={onChange}
        ariaLabel="AsyncAPI sections"
        selectLabel="Select an AsyncAPI section"
      />
    </div>
  );

  return (
    <div className="flex w-full justify-center">
        <Section content={content} stickySideContent={false} />
    </div>
  );
}
