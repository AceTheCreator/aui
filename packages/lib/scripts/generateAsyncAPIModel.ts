import { TypeScriptFileGenerator } from '@asyncapi/modelina';
import path from 'path';
import { fileURLToPath } from 'url';
import spec from '../src/config/specs/3.0.0-without-$id.json';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const outputDir = path.resolve(__dirname, '../types/asyncapi');

const generator = new TypeScriptFileGenerator({
  modelType: 'interface',
  rawPropertyNames: true
});

generator.generateToFiles(spec, outputDir, { exportType: 'named' }).then(() => {
  console.log('AsyncAPI models generated successfully!');
}).catch((error) => {
  console.error('Error generating AsyncAPI models:', error);
});
