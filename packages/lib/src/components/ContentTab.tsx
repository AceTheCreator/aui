import Section from "./Section";
import Tabs, { Tab } from "./Tabs";

export type ContentTabItem = Tab;

interface ContentTabProps {
  tabs: ContentTabItem[];
  current: string | null;
  onChange: (id: string) => void;
}

export default function ContentTab({ tabs, current, onChange }: ContentTabProps) {
  if (!tabs.length) {
    return null;
  }

  const content = (
    <div className="w-full mt-10 @lg:mt-0">
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
    <div className="sticky top-0 z-10 flex w-full justify-center bg-background">
      <Section content={content} stickySideContent={false} />
    </div>
  );
}
