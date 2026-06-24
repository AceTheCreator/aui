import React from "react";
import Section from "../../components/Section";
import Markdown from "../../components/Markdown";
import InfoMetadata from "../../components/InfoMetadata";
import { Info as AsyncAPIMetadata } from "../../types/asyncapi/Info";

const Information: React.FunctionComponent<AsyncAPIMetadata> = ({
  title,
  version,
  description,
  license,
  externalDocs,
  contact,
  tags,
  extensions,
}) => {
  // console.log(extensions);
  const content = (
    <>
      <h1 className="inline-block text-3xl font-extrabold text-neutral-900 tracking-tight">
        {title}
      </h1>
      <div className="prose mt-4 text-neutral-500">
        <Markdown>{description}</Markdown>
      </div>
    </>
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
        content={content}
        sideContent={sideContent}
        stickySideContent={true}
      />
    </div>
  );
};

export default Information;
