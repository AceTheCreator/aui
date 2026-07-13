import React from "react";
import Section from "../../components/Section";
import Markdown from "../../components/Markdown";
import InfoMetadata from "../../components/InfoMetadata";
import { Info as AsyncAPIMetadata } from "../../types/asyncapi/Info";

const Information: React.FunctionComponent<AsyncAPIMetadata> = ({
  title,
  description,
  license,
  externalDocs,
  contact,
  tags,
}) => {

  const content = (
      <div className="mt-4 w-full">
        <Markdown>{description}</Markdown>
      </div>
  );

  const sideContent = (
    <InfoMetadata
      license={license}
      externalDocs={externalDocs}
      contact={contact}
      tags={tags}
    />
  );

  return (
    <div className="flex justify-center w-full">
      <Section
        title={title}
        content={content}
        sideContent={sideContent}
        stickySideContent={true}
        reverseLayoutOnMobile={true}
        info={true}
      />
    </div>
  );
};

export default Information;
