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
    <div className="w-full sm:w-auto">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <section
        className="border-neutral-200 text-lg mb-10 lg:flex lg:justify-between"
      >
        <div className="sm:w-prose">
          {content}
        </div>
        <div className="pl-0 pt-8 lg:pt-0 lg:pl-12 xl:pt-0 lg:w-[400px]">
          <div className={`${stickySideContent && "sticky top-4"}`}>
            {sideContent}
          </div>
        </div>
      </section>
    </div>
  );
}
