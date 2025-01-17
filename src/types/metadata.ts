export interface Contact {
    name?: string;
    url?: string;
    email?: string;
  }

  export interface License {
    name: string;
    url?: string;
  }

  export interface ExternalDocs {
    description?: string;
    url: string;
  }

  export interface Tags {
    name: string;
    description?: string;
    externalDocs?: ExternalDocs;
  }

  export type Extensions = {
    [key: `x-${string}`]: string;
  }

  export interface AsyncAPIMetadata {
    title: string;
    version: string;
    description?: string;
    license?: License;
    externalDocs?: ExternalDocs;
    contact?: Contact;
    tags?: Tags[];
    extensions?: Extensions;
  }

  export function isExtensionKey(key: string): key is `x-${string}` {
    return key.startsWith('x-');
  }
  
  export function isValidMetadata(metadata: Partial<AsyncAPIMetadata>): metadata is AsyncAPIMetadata {
    return Boolean(
      metadata.title &&
      metadata.version
    );
  }