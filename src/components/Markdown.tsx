import React from "react";
import DOMPurify from "isomorphic-dompurify";

import { renderMarkdown } from "../helpers/marked";

const Markdown: React.FunctionComponent<{
  children: React.ReactNode;
}> = ({ children }) => {
  if (!children) {
    return null;
  }
  if (typeof children !== "string") {
    return <>{children}</>;
  }

  return (
    <div
      className="prose max-w-none"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(renderMarkdown(children)),
      }}
    />
  );
};

export default Markdown;
