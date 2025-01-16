import IconAtSymbol from "../icons/AtSymbol"
import IconExternalLink from "../icons/ExternalLink"
import IconGlobe from "../icons/Globe"
import IconScale from "../icons/Scale"
import IconTag from "../icons/Tag"
import DefinitionListItem from "./DefinitionListItem"
import Tag from "./Tag"
import {LICENSE_TEXT, CONTACT_TEXT, TAGS_TEXT, EMAIL_TEXT, EXTERAL_DOCUMENTATION_TEXT} from '../contants';
import { License, ExternalDocs, Contact, Tags } from "../types/metadata"

interface InfoMetadataProps {
  license?: License,
  externalDocs?: ExternalDocs,
  contact?: Contact,
  tags?: Tags[]
}

export default function InfoMetadata ({
    license,
    externalDocs,
    contact,
    tags,
}: InfoMetadataProps){
    const details = {
        licenseName: license && license.name ? license.name : null,
        licenseUrl: license && license.url ? license.url :  null,
        externalDocsTitle: externalDocs && externalDocs.description ? externalDocs.description : 'External documentation',
        externalDocsUrl: externalDocs && externalDocs.url ? externalDocs.url :  null,
        externalDocsDescription: externalDocs && externalDocs.description ? externalDocs.description : null,
        contactName: contact && contact.name ? contact.name : null,
        contactUrl: contact && contact.url ? contact.url : null,
        contactEmail: contact && contact.email ? contact.email : null,
        tags: tags,
      }
    return (
        <dl>
        <DefinitionListItem IconClass={IconScale} text={`${details.licenseName} ${LICENSE_TEXT}`} href={details.licenseUrl} className="inline-block mb-4 text-gray-700 hover:text-pink-500" />
        <DefinitionListItem IconClass={IconExternalLink} text={EXTERAL_DOCUMENTATION_TEXT} href={details.externalDocsUrl} className="inline-block mb-4 text-gray-700 hover:text-indigo-500" />
        <DefinitionListItem IconClass={IconAtSymbol} text={`${EMAIL_TEXT} ${details.contactName}`} href={`mailto:${details.contactEmail}`} className="inline-block mb-4 text-gray-700 hover:text-green-500" />
        <DefinitionListItem IconClass={IconGlobe} text={`${CONTACT_TEXT} ${details.contactName}`} href={details.contactUrl} className="inline-block mb-4 text-gray-700 hover:text-green-500" />
        <DefinitionListItem
          IconClass={IconTag}
          text={TAGS_TEXT}
          className="inline-block mb-2 text-gray-700"
          itemChildren={
            details.tags && details.tags.map((tag, index) => (
              <Tag
                key={index}
                href={tag.externalDocs && tag.externalDocs.url}
                title={tag.description || (tag.externalDocs && tag.externalDocs.description ? tag.externalDocs.description : null)}
                name={tag.name}
              />
            ))
          }
        />
      </dl>
    )
}