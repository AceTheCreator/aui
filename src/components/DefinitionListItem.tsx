import { FC, ComponentType, ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

interface DefinitionListItemProps {
  IconClass?: ComponentType<{ className: string; title: string; alt: string }>;
  text: string | ReactNode;
  href?: string | null;
  term?: string;
  visibleTerm?: boolean;
  vertical?: boolean;
  className?: string;
}

export default function DefinitionListItem({
  IconClass,
  term,
  visibleTerm = true,
  text,
  href,
  vertical = false,
  className = "",
}: DefinitionListItemProps) {
  const Wrapper: FC<WrapperProps> = href
    ? (props) => <a href={href} target="_blank" {...props} />
    : (props) => <div {...props} />;

  return (
    <div className={`${!vertical && "flex"} ${className}`}>
      <dt>
        <Wrapper className="flex">
          {IconClass && (
            <IconClass className="w-5 h-5" title={`${text}`} alt={`${text}`} />
          )}
          {visibleTerm ? (
            <span className="pl-2 text-sm">{term}</span>
          ) : (
            <span className="sr-only">{term}</span>
          )}
        </Wrapper>
      </dt>
      <dd className={`${vertical && "pt-2"} pl-2 text-sm`}>
        {!visibleTerm && <Wrapper>{text}</Wrapper>}
        {vertical && <Wrapper>{text}</Wrapper>}
      </dd>
    </div>
  );
}
