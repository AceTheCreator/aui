import React from 'react';
import Section from '../../components/Section';
import Markdown from '../../components/Markdown';
import InfoMetadata from '../../components/InfoMetadata';
import { AsyncAPIMetadata } from '../../types/metadata';


const Information: React.FunctionComponent<AsyncAPIMetadata> = ({title, version, description, license, externalDocs, contact, tags, extensions}) => {
  const content = <>
  <div className='text-xs w-16 h-6 font-semibold bg-green-300 flex justify-center items-center h-8 whitespace-nowrap break-all leading-8 rounded-xl bg-gray-300 py-1 px-2 mr-1 -mt-1'>v{version}</div>
  <h1 className="inline-block mt-4 text-3xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
  <div className="prose mt-4 text-gray-500">
    <Markdown>{description}</Markdown>
  </div>
  </>

const sideContent = (
  <InfoMetadata
    license={license}
    externalDocs={externalDocs}
    contact={contact}
    tags={tags}
  />
)
  
    return <div className='flex justify-center w-full'>
      <Section content={content} sideContent={sideContent} stickySideContent={true}/>
    </div> ;
  };
  
  export default Information;