import IconAtSymbol from "../icons/AtSymbol"
import IconExternalLink from "../icons/ExternalLink"
import IconGlobe from "../icons/Globe"
import IconScale from "../icons/Scale"
import IconTag from "../icons/Tag"
import DefinitionListItem from "./DefinitionListItem"
import Tag from "./Tag"

export default function InfoMetadata ({
    license,
    externalDocs,
    contact,
    tags,
}){
    const details = {
        licenseName: license && license.name ? license.name : null,
        licenseUrl: license && license.url ? license.url :  null,
        externalDocsTitle: externalDocs && externalDocs.title ? externalDocs.title : 'External documentation',
        externalDocsUrl: externalDocs && externalDocs.url ? externalDocs.url :  null,
        externalDocsDescription: externalDocs && externalDocs.description ? externalDocs.description : null,
        contactName: contact && contact.name ? contact.name : null,
        contactUrl: contact && contact.url ? contact.url : null,
        contactEmail: contact && contact.email ? contact.email : null,
        tags: tags,
      }
    return (
        <dl>
        <DefinitionListItem IconClass={IconScale} text={`${details.licenseName} License`} term="License" visibleTerm={false} href={details.licenseUrl} className="inline-block mb-4 text-gray-700 hover:text-pink-500" />
        <DefinitionListItem IconClass={IconExternalLink} text="External documentation" href={details.externalDocsUrl} term="External documentation" visibleTerm={false} title={details.externalDocsDescription} className="inline-block mb-4 text-gray-700 hover:text-indigo-500" />
        <DefinitionListItem IconClass={IconAtSymbol} text={`Email ${details.contactName}`} term="Email" visibleTerm={false} href={`mailto:${details.contactEmail}`} className="inline-block mb-4 text-gray-700 hover:text-green-500" />
        <DefinitionListItem IconClass={IconGlobe} text={`Contact ${details.contactName}`} term="Contact" visibleTerm={false} href={details.contactUrl} className="inline-block mb-4 text-gray-700 hover:text-green-500" />
        <DefinitionListItem
          IconClass={IconTag}
          term="Tags"
          className="inline-block mb-2 text-gray-700"
          vertical
          text={
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