import avroStreetlightExample from '../examples/avro-streetlight.json'
import tortureExample from '../examples/torture.json'

const RAW_URLS = [
  'https://github.com/asyncapi/spec/blob/master/examples/streetlights-operation-security-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/adeo-kafka-request-reply-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/anyof-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/application-headers-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/correlation-id-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/gitter-streaming-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/kraken-websocket-request-reply-message-filter-in-reply-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/kraken-websocket-request-reply-multiple-channels-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/mercure-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/not-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/oneof-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/operation-security-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/rpc-client-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/rpc-server-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/simple-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/slack-rtm-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/streetlights-kafka-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/streetlights-mqtt-asyncapi.yml',
  'https://github.com/asyncapi/spec/blob/master/examples/websocket-gemini-asyncapi.yml',
]

function labelFromUrl(url: string): string {
  const filename = url.split('/').pop() ?? url
  const name = filename.replace(/-asyncapi\.ya?ml$/i, '')
  return name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export interface SuggestedSchema {
  label: string
  url: string
  /** Inline document text for bundled examples — loaded directly, no fetch. */
  content?: string
}

export const SUGGESTED_SCHEMAS: SuggestedSchema[] = [
  ...[...new Set(RAW_URLS)].map((url) => ({
    url,
    label: labelFromUrl(url),
  })),
  {
    label: 'Streetlights Avro',
    url: 'local://avro-streetlight.json',
    content: JSON.stringify(avroStreetlightExample, null, 2),
  },
  {
    label: 'Unrealistic Torture Test',
    url: 'local://torture.json',
    content: JSON.stringify(tortureExample, null, 2),
  },
]
