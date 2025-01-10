import ReactMarkdown from 'react-markdown'

export default function Markdown({children}) {
    return     <div className="prose mt-4 text-gray-500">
    <ReactMarkdown>{children}</ReactMarkdown>
  </div>
}