import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  content?: ReactNode;
  sideContent?: ReactNode | null;
  stickySideContent: boolean;
  reverseLayoutOnMobile?: boolean;
}

export default function Section({
  title,
  content,
  sideContent,
  stickySideContent = false,
  reverseLayoutOnMobile = false,
}: SectionProps) {
  return (
    <div className="w-full sm:w-auto">
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      <section
        className={`border-border text-lg mb-10 flex lg:justify-between ${
          sideContent && reverseLayoutOnMobile
            ? "flex-col-reverse lg:flex-row"
            : "flex-col lg:flex-row"
        }`}
      >
        <div className="sm:w-prose">{content}</div>
        <div className="pt-6 lg:pt-0 lg:pl-12 lg:w-[400px] shrink-0">
          <div className={`${stickySideContent && "lg:sticky lg:top-4"}`}>
            {sideContent}
          </div>
        </div>
      </section>
    </div>
  );
}
