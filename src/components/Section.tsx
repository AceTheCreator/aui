import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  content?: ReactNode;
  sideContent?: ReactNode;
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
      {title && (
        <h1 className="inline-block mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">
          {title}
        </h1>
      )}
      <section className="pb-10 border-b border-gray-200 text-lg mb-10 lg:flex lg:justify-between">
        <div className="xl:w-prose lg:w-mprose">{content}</div>
        <div className="pl-0 pt-8 lg:pt-0 xl:pl-12 xl:pt-0 ">
          <div className={`${stickySideContent && "sticky top-4"}`}>
            {sideContent}
          </div>
        </div>
      </section>
    </div>
  );
}
