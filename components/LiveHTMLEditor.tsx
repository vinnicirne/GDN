
import React, { useState, useEffect } from 'react';

interface LiveHTMLEditorProps {
  initialHtml: string;
}

export const LiveHTMLEditor: React.FC<LiveHTMLEditorProps> = ({ initialHtml }) => {
  const [htmlContent, setHtmlContent] = useState(initialHtml);

  // Update iframe content whenever htmlContent changes
  const iframeContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-g">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Live Preview</title>
      <style>
        /* Small scrollbar for the preview */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #1a1a1a; }
        ::-webkit-scrollbar-thumb { background: #4a4a4a; }
        ::-webkit-scrollbar-thumb:hover { background: #555; }
      </style>
    </head>
    <body class="bg-gray-900 text-white">
      ${htmlContent}
    </body>
    </html>
  `;

  const handleExport = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'landing-page.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-black/30 border border-green-900/40 rounded-xl shadow-lg shadow-black/30 overflow-hidden animate-fade-in-up">
      <div className="p-4 bg-black/40 border-b border-green-900/30 flex justify-between items-center">
        <h3 className="font-bold text-green-400">Editor de Landing Page ao Vivo</h3>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-xs font-bold text-black bg-green-600 rounded-lg hover:bg-green-500 transition"
        >
          <i className="fas fa-download mr-2"></i>
          Exportar HTML
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[70vh]">
        {/* Editor Column */}
        <div className="h-full">
          <textarea
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            className="w-full h-full p-4 bg-gray-900 text-gray-300 font-mono text-xs border-r border-green-900/30 resize-none focus:outline-none"
            placeholder="Cole seu código HTML aqui..."
          />
        </div>
        {/* Preview Column */}
        <div className="h-full bg-white">
          <iframe
            srcDoc={iframeContent}
            title="Live Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};
