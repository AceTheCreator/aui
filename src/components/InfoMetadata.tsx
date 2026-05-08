import IconAtSymbol from "../icons/AtSymbol";
import IconExternalLink from "../icons/ExternalLink";
import IconGlobe from "../icons/Globe";
import IconScale from "../icons/Scale";
import IconTag from "../icons/Tag";
import DefinitionListItem from "./DefinitionListItem";
import Tag from "./Tag";
import {
  LICENSE_TEXT,
  CONTACT_TEXT,
  TAGS_TEXT,
  EMAIL_TEXT,
  EXTERNAL_DOCUMENTATION_TEXT,
} from "../contants";
import { Info } from "../types/asyncapi/Info";
import { Tag as TagType } from "../types/asyncapi/Tag";
import { ExternalDocs } from "../types/asyncapi/ExternalDocs";

export default function InfoMetadata({
  license,
  externalDocs,
  contact,
  tags,
}: Info) {
  const resolvedExternalDocs = externalDocs as ExternalDocs | undefined;
  const details = {
    licenseName: license && license.name ? license.name : null,
    licenseUrl: license && license.url ? license.url : null,
    externalDocsTitle:
      resolvedExternalDocs && resolvedExternalDocs.description
        ? resolvedExternalDocs.description
        : "External documentation",
    externalDocsUrl: resolvedExternalDocs && resolvedExternalDocs.url ? resolvedExternalDocs.url : null,
    externalDocsDescription:
      resolvedExternalDocs && resolvedExternalDocs.description
        ? resolvedExternalDocs.description
        : null,
    contactName: contact && contact.name ? contact.name : null,
    contactUrl: contact && contact.url ? contact.url : null,
    contactEmail: contact && contact.email ? contact.email : null,
    tags: tags,
  };
  return (
    <dl>
      {details.licenseName && (
        <DefinitionListItem
          IconClass={IconScale}
          text={`${details.licenseName} ${LICENSE_TEXT}`}
          term={LICENSE_TEXT}
          visibleTerm={details.licenseName ? false : true}
          href={details.licenseUrl}
          className="inline-block mb-4 text-gray-700 hover:text-pink-500"
        />
      )}
      {details.externalDocsUrl && (
        <DefinitionListItem
          IconClass={IconExternalLink}
          text={EXTERNAL_DOCUMENTATION_TEXT}
          href={details.externalDocsUrl}
          term={EXTERNAL_DOCUMENTATION_TEXT}
          visibleTerm={details.externalDocsTitle ? false : true}
          className="inline-block mb-4 text-gray-700 hover:text-indigo-500"
        />
      )}
      {details.contactEmail && (
        <DefinitionListItem
          IconClass={IconAtSymbol}
          text={`${details.contactEmail}`}
          term={EMAIL_TEXT}
          visibleTerm={details.contactEmail ? false : true}
          href={`mailto:${details.contactEmail}`}
          className="inline-block mb-4 text-gray-700 hover:text-green-500"
        />
      )}
      {details.contactUrl && (
        <DefinitionListItem
          IconClass={IconGlobe}
          text={`${details.contactName}`}
          term={CONTACT_TEXT}
          visibleTerm={details.contactName ? false : true}
          href={details.contactUrl}
          className="inline-block mb-4 text-gray-700 hover:text-green-500"
        />
      )}
      {details.tags && (
        <DefinitionListItem
          IconClass={IconTag}
          term={TAGS_TEXT}
          className="mb-2 text-gray-700 inline-block"
          vertical
          text={
            details.tags && (
              <div className="flex flex-wrap gap-1 -ml-2">
                {details.tags.map((tag, index) => {
                  const t = tag as TagType;
                  const extDocs = t.externalDocs as ExternalDocs | undefined;
                  return (
                    <Tag
                      key={index}
                      href={extDocs && extDocs.url}
                      title={
                        t.description ||
                        (extDocs && extDocs.description ? extDocs.description : undefined)
                      }
                      name={t.name}
                    />
                  );
                })}
              </div>
            )
          }
        />
      )}
    </dl>
  );
}
