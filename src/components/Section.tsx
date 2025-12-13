import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  content?: ReactNode;
  sideContent?: ReactNode | null;
  stickySideContent: boolean;
}

export default function Section({
  title,
  content,
  sideContent,
  stickySideContent = false,
}: SectionProps) {
  return (
    <div>
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <section className="pb-10 border-b border-gray-200 text-lg mb-10 lg:flex lg:justify-between">
        <div className="xl:w-prose lg:w-mprose">{content}</div>
        <div className="pl-0 pt-8 lg:pt-0 lg:pl-12 xl:pt-0 lg:w-[400px]">
          <div className={`${stickySideContent && "sticky top-4"}`}>
            {sideContent}
          </div>
        </div>
      </section>
    </div>
  );
}
