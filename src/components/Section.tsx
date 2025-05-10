import { ReactNode } from "react";

interface SectionProps {
  optional?: string;
  title?: string;
  content?: ReactNode;
  sideContent?: ReactNode;
  stickySideContent: boolean;
}

export default function Section({
  optional,
  title,
  content,
  sideContent,
  stickySideContent = false,
}: SectionProps) {
  return (
    <div>
      {optional && (
        <div className="text-xs w-20 mt-4 mb-4 h-5 font-semibold bg-indigo-400 border border-indigo-800 flex justify-center items-center h-8 whitespace-nowrap break-all leading-8 rounded-md bg-gray-300 py-1 px-2 mr-1 -mt-1 animate-pulse">
          {optional}
        </div>
      )}
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
