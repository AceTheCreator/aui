import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";

import "highlight.js/styles/night-owl.css";

import hljs from "highlight.js/lib/core";

import json from "highlight.js/lib/languages/json";

hljs.registerLanguage("json", json);

import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("yaml", yaml);

import bash from "highlight.js/lib/languages/bash";

hljs.registerLanguage("bash", bash);

const marked = new Marked(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, language, info) {
      if (!hljs.getLanguage(language)) {
        return code;
      }
      try {
        return hljs.highlight(code, { language }).value;
      } catch (e) {
        return code;
      }
    },
  })
);

marked.use({
  extensions: [
    {
      name: "link",
      renderer(token) {
        return `<a class="hover:underline hover:text-indigo-600" href="${token.href}" rel="noopener noreferrer" target="_blank">${token.text}</a>`;
      },
    },
  ],
});

export function renderMarkdown(content: string): string {
  return marked.parse(content);
}

export { hljs };
